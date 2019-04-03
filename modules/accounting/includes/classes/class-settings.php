<?php
namespace WeDevs\ERP\Accounting\Includes\Classes;

use WeDevs\ERP\Framework\ERP_Settings_Page;

/**
 * General class
 */
class Settings extends ERP_Settings_Page {


    function __construct() {
        $this->id            = 'erp-ac';
        $this->label         = __( 'Accounting', 'erp' );
        $this->single_option = true;
        $this->sections      = $this->get_sections();
    }

   /**
     * Get sections
     *
     * @return array
     */
    public function get_sections() {
        $sections = array(
            'currency_option' => __( 'Currency Settings', 'erp' )
        );

        return apply_filters( 'erp_get_sections_' . $this->id, $sections );
    }

    /**
     * Get sections fields
     *
     * @return array
     */
    public function get_section_fields( $section = '' ) {

        $symbol = erp_acct_get_currency_symbol();

        $fields['currency_option'] = array(

            array( 'title' => __( '', 'erp' ), 'type' => 'title', 'desc' => '', 'id' => 'general_options' ),

            array(
                'title'   => __( 'Currency Position', 'erp' ),
                'id'      => 'erp_ac_currency_position',
                'type'    => 'select',
                'class'   => 'erp-select2',
                'options' => array(
                    'left'        => sprintf( '%1$s (%2$s99.99)', __( 'Left', 'erp' ), $symbol ),
                    'right'       => sprintf( '%1$s (99.99%2$s)', __( 'Right', 'erp' ), $symbol ),
                    'left_space'  => sprintf( '%1$s (%2$s 99.99)', __( 'Left with space', 'erp' ), $symbol ),
                    'right_space' => sprintf( '%1$s (99.99 %2$s)', __( 'Right with space', 'erp' ), $symbol ),
                ),
            ),

            array(
                'title'   => __( 'Thousand Separator', 'erp' ),
                'type'    => 'text',
                'id'      => 'erp_ac_th_separator',
                'default' => ','
            ),

            array(
                'title'   => __( 'Decimal Separator', 'erp' ),
                'id'      => 'erp_ac_de_separator',
                'type'    => 'text',
                'default' => '.'
            ),

            array(
                'title'   => __( 'Number of Decimals', 'erp' ),
                'type'    => 'text',
                'id'      => 'erp_ac_nm_decimal',
                'default' => 2
            ),

            array( 'type' => 'sectionend', 'id' => 'script_styling_options' ),

        ); // End general settings

        $section = $section === false ? $fields['checkout'] : isset( $fields[$section] ) ? $fields[$section] : array();

        return apply_filters( 'erp_ac_settings_section_fields_' . $this->id , $section );
    }

    /**
     * Get sections fields
     *
     * @return array
     */
    public function get_settings() {

        $fields = array(

            array( 'title' => __( 'Accounting Settings', 'erp' ), 'type' => 'title', 'desc' => '', 'id' => 'general_options' ),

            array(
                'title'   => __( 'Home Currency', 'erp' ),
                'id'      => 'base_currency',
                'desc'    => __( 'The base currency of the system.', 'erp' ),
                'type'    => 'select',
                'options' => erp_get_currencies()
            ),

            array( 'type' => 'sectionend', 'id' => 'script_styling_options' ),

        ); // End general settings


        return apply_filters( 'erp_ac_settings_general', $fields );
    }

}

return new Settings();