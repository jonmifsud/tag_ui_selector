(function($, Symphony) {
	'use strict';

	Symphony.Extensions.TagUISelector = function() {
		var fields;

		var init = function() {
			fields = Symphony.Elements.contents.find('.field-taglist');
			fields.each(buildInterface);
		};

		var updateFilters = function(id,newfilters) {
			fields.each(function(){
				var field = $(this); 
				if (field.attr('id') == "field-" + id){
					field.data("filters",newfilters);
					var storage = field.find('.selectized'),
						selectize = storage[0].selectize,
						fieldId = field.data('parent-section-field-id'),
						limit = parseInt(field.data('limit')),
						numeric = true;
					//clear existing options as filters have changed
					selectize.clearOptions();
					fetchOptions(fieldId, "", newfilters, limit, numeric, function(values){ 
						$.each(values,function(index, entry){ 
							console.log(entry);
							selectize.addOption(entry);
						});
					 });
				}
			});
		};

		var buildInterface = function() {
			var field = $(this),
				fieldId = field.data('parent-section-field-id'),
				filters = {},
				storage = field.find('select:visible, input:visible').first(),
				numeric = false,
				limit = parseInt(field.data('limit')),
				fetched = false,
				selectize;

			if ( field.hasClass('field-taglist') && typeof(field.data('parent-selection-field-id')) == 'undefined' ){
				//obtain from self
				fieldId = field.attr('id').substr(6); 
				limit = 10;
				field.data('limit', limit); 
				field.data('parent-section-field-id',fieldId);
				field.attr('data-interface','aui-selector');
				field.find('ul.tags[data-interactive]').hide();
			}

			$.each(field.data(),function(index, value){ 
				if (index.indexOf("filter") == 0 ){
					var filter = index.substring(6).toLowerCase();
					filters[filter] = value;
				}
			});

			field.data("filters",filters);

			// Check for storage element
			if(!storage.length) {
				return false;
			}

			// Apply Selectize
			storage.selectize({
				preload: (limit === 0),
				sortField: [{
					field: 'text', 
					direction: 'asc'
				}],
				plugins: {
					'remove_button': {
						label : Symphony.Language.get('Remove'),
						title : Symphony.Language.get('Remove'),
						className : 'destructor'
					}
				},
				hideSelected: true,
				render: {
					item: renderItem,
					option: renderOption
				},				
				create: function(input) {
					return {
						value: input,
						text: input
					}
				},
				load: function(query, callback) {
					if((!query.length && limit > 0) || fetched === true) {
						return callback();
					}

					filters = this.$wrapper.closest('.field').data('filters');

					// Fetch search options
					fetchOptions(fieldId, query, filters, limit, numeric, callback);

					// Only fetch full list of option once
					if(limit === 0) {
						fetched = true;
					}
				}
			});

			// Set placeholder text
			selectize = storage[0].selectize;
			selectize.$control_input.attr('placeholder', Symphony.Language.get('Search and select') + ' …');

			// Don't auto-focus the input in multiple mode
			if(storage.is('[multiple]')) {
				selectize.$control.off('mousedown');
			}
	
			// Make sortable
			if(field.is('[data-interface="aui-selector-sortable"]')) {
				selectize.$control.symphonyOrderable({
					items: '.item',
					handles: 'span',
					ignore: 'input, textarea, select, a',
					delay: 250
				});
				selectize.$control.on('orderstart.orderable', function() {
					orderStart(selectize);
				});
				selectize.$control.on('orderstop.orderable', function() {
					orderStop(selectize);
				});
			}

			// Hide dropdown after item removal
			selectize.$control.on('mousedown', '.destructor', function() {
				toggleDropdownVisibility(selectize);
			});
			selectize.$control.on('mouseup', '.destructor', function() {
				toggleDropdownVisibility(selectize, true);
			});
		};

		var fetchOptions = function(fieldId, query, filters, limit, numeric, callback) {
			$.ajax({
				url: Symphony.Context.get('root') + '/symphony/extension/tag_ui_selector/tag/',
				data: {
					field_id: fieldId,
					query: encodeURIComponent(query),
					filter: filters,
					limit: limit
				},
				type: 'GET',
				error: function() {
					callback();
				},
				success: function(result) {
					var values = [];

					$.each(result.values, function(id, data) {
						values.push({
							value: data,
							text: data,
							id: data
						});
					});

					callback(values);
				}
			});
		};

		var renderItem = function(data, escape) {
			return '<div class="item" data-section-handle="' + data.section + '" data-link="' + data.link + '" data-entry-id="' + data.id + '"><span>' + data.text + '</span></div>';
		};

		var renderOption = function(data, escape) {
			return '<div class="option"><span>' + data.text + '</span></div>';
		};

		var orderStart = function(selectize) {
			toggleDropdownVisibility(selectize);
		};

		var orderStop = function(selectize) {
			var values = [];

			// Close and reveal dropdown
			toggleDropdownVisibility(selectize, true);

			// Store order
			selectize.$control.children('[data-value]').each(function() {
				values.push($(this).attr('data-value'));
			});
			selectize.setValue(values);
		};

		var toggleDropdownVisibility = function(selectize, show) {
			if(show === true) {
				setTimeout(function() {
					selectize.blur();
					selectize.$dropdown.css('opacity', 1);
				}, 250);			}
			else {
				selectize.$dropdown.css('opacity', 0);
			}
		};

		// API
		return {
			init: init,
			updateFilters: updateFilters
		};
	}();

	$(document).on('ready.aui-selector', function() {
		Symphony.Extensions.TagUISelector.init();
	});

})(window.jQuery, window.Symphony);
