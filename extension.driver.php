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


            $canAdd = Administration::instance()->Author()->isDeveloper() ? "true" : "false";
            // var_dump($canAdd);die;
            Administration::instance()->Page->addElementToHead(
                new XMLElement('script', 'Symphony.TagUISelector={"canAdd" : '.$canAdd.'}', array(
                    'type' => 'text/javascript'
                ))
            );

            Administration::instance()->Page->addScriptToHead(URL . '/extensions/tag_ui_selector/assets/tagui.selector.publish.js');
            Administration::instance()->Page->addStylesheetToHead(URL . '/extensions/tag_ui_selector/assets/tagui.selector.publish.css');
        }
    }

}
