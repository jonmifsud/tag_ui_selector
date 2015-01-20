<?php

Class extension_tag_ui_selector extends Extension
{
   
    /**
     * {@inheritDoc}
     */
    public function getSubscribedDelegates()
    {
        return array(
            array(
                'page' => '/backend/',
                'delegate' => 'InitaliseAdminPageHead',
                'callback' => 'appendAssets'
            )
        );
    }

    /**
     * Append assets
     */
    public function appendAssets()
    {
        $callback = Symphony::Engine()->getPageCallback();

        if ($callback['driver'] == 'publish' && $callback['context']['page'] !== 'index') {
            Administration::instance()->Page->addScriptToHead(URL . '/extensions/tag_ui_selector/assets/tagui.selector.publish.js');
            Administration::instance()->Page->addStylesheetToHead(URL . '/extensions/tag_ui_selector/assets/tagui.selector.publish.css');
        }
    }

}
