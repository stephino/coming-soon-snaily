<?php

    class Newsletter {
                
        // Save types - Do not change!
        const SAVE_EMAIL    = 'save_email';
        const SAVE_DATABASE = 'save_database';
        const SAVE_TEXTFILE = 'save_textfile';
        
        /**
         * CHANGE: Set the save type by choosing one of the above constants
         * 
         * self::SAVE_EMAIL - Save the message by e-mail
         * self::SAVE_DATABASE - Save the message in a database table
         * self::SAVE_TEXTFILE - Save the message in a text file on the server
         * 
         * @var string
         */
        protected $_saveType = self::SAVE_TEXTFILE;
        
        /**
         * CHANGE: Save configuration
         * Provide the values for the appropiate Save Type (selected above)
         * 
         * @var array
         */
        protected $_saveConfiguration = array(
            // Database configuration
            self::SAVE_DATABASE => array(
                'db_server'   => 'localhost', // Set the appropiate MySQL server name
                'db_name'     => 'subscribers', // Set the appropiate MySQL database name - you must create it first
                'db_username' => 'root', // Set the appropiate MySQL username that has access to the provided database
                'db_password' => '', // Set the user's password; leave empty if not applicable
                'table_name'  => 'subscribers', // Set the table to store the message in; it must have the following columns: ID, EMAIL
            ),
            /**
             * Example table structure:
               CREATE TABLE `ia`.`subscribers` (
               `ID` INT( 11 ) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY ,
               `EMAIL` VARCHAR( 200 ) NULL
               ) ENGINE = MYISAM ;
             */
            
            // Email configuration
            self::SAVE_EMAIL => array(
                'to' => 'contact@example.com', // Correspondent's e-mail address
            ),
            
            // Text file configuration
            self::SAVE_TEXTFILE => array(
                'filename' => 'subscribers.txt', // The name of the file to store the messages in
            )
        );
        
/*********************************************************************************
 * Do not edit below this line unless you know what you are doing.
 * 
 * Thank you.
 * *******************************************************************************/  
        
        /**
         * Hold the newsletter instance
         * @var Newsletter
         */
        private static $_instance;
        
        // Message types
        const MESSAGE_TRY_AGAIN      = 'message_try_again';
        const MESSAGE_INVALID_FORM   = 'message_invalid_form';
        const MESSAGE_INVALID_EMAIL  = 'message_invalid_email';
        const MESSAGE_COULD_NOT_SAVE = 'message_could_not_save';
        const MESSAGE_SUCCESS        = 'message_success';
        
        // Save the available messages
        protected $_messages = array(
            self::MESSAGE_TRY_AGAIN      => 'Please refresh and try again.',
            self::MESSAGE_INVALID_FORM   => 'Invalid form submitted.',
            self::MESSAGE_INVALID_EMAIL  => 'Invalid e-mail submitted.',
            self::MESSAGE_COULD_NOT_SAVE => 'Could not save your e-mail.',
            self::MESSAGE_SUCCESS        => 'Thank you! You will be the first to know when we launch.',
        );
        
        /**
         * Output messages
         * 
         * @var array
         */
        protected $_output = array();
        
        /**
         * Singleton
         */
        private function __construct(){}
        
        /**
         * Get an instance
         * 
         * @return Newsletter
         */
        public static function getInstance() {
            if (!isset(self::$_instance)) {
                self::$_instance = new self();
            }
            return self::$_instance;
        }
        
        /**
         * Script initialization
         * 
         * @return void
         */
        protected function _init() {
            // JSON response
            header('content-type:application/json');
            
            // Start the Output Buffer
            ob_start();
            
            // No error reporting
            error_reporting(0);
            
            // No time limit
            set_time_limit(0);
            
            // Set the flush
            register_shutdown_function(array($this, 'flush'));
        }
        
        /**
         * Flush the output
         */
        public function flush() {
            // No direct echos allowed
            ob_end_clean();

            // Display the messages
            echo json_encode($this->_output);
            
            // Stop here
            exit();
        }
        
        /**
         * Add a response message
         * 
         * @param string         $message Message
         * @param boolean|string $status  Message status
         */
        protected function _setMessage($message, $status = true) {
            $this->_output[] = array(
                'message' => $message,
                'status'  => $status
            );
        }
        
        /**
         * Run the newsletter
         */
        public function run() {
            // Initialize the script
            $this->_init();
            
            do {
                // We need the e-mail field
                if (!$this->_hasPosted('email')) {
                    $this->_setMessage($this->_messages[self::MESSAGE_INVALID_FORM], false);
                    $this->_setMessage($this->_messages[self::MESSAGE_TRY_AGAIN], 'info');
                    break;
                }
                
                // Get the e-mail field
                $email = $_POST['email'];
                
                // Validate the e-mail
                if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    $this->_setMessage($this->_messages[self::MESSAGE_INVALID_EMAIL], false);
                    $this->_setMessage($this->_messages[self::MESSAGE_TRY_AGAIN], 'info');
                    break;
                }
                
                // Try to save the e-mail
                if (@!$this->_saveEmail($email)) {
                    $this->_setMessage($this->_messages[self::MESSAGE_COULD_NOT_SAVE], false);
                    $this->_setMessage($this->_messages[self::MESSAGE_TRY_AGAIN], 'info');
                    break;
                }
                
                // Default thank you message
                $this->_setMessage($this->_messages[self::MESSAGE_SUCCESS]);
                
            } while (false);
        }
        
        
        /**
         * Save the e-mail
         * 
         * @param string $email   E-mail address
         * @return boolean
         */
        protected function _saveEmail($email) {
            return true;
            
            // Strtolower on the e-mail
            $email = strtolower($email);
            
            switch ($this->_saveType) {
                case self::SAVE_TEXTFILE:
                    return $this->_saveEmailTextFile($email);
                    break;
                case self::SAVE_DATABASE:
                    return $this->_saveEmailDb($email);
                    break;
                case self::SAVE_EMAIL:
                default:
                    return $this->_saveEmailEmail($email);
                    break;
            }
        }
        
        /**
         * Save the e-mail in a text file
         * 
         * @param string $email E-mail
         */
        protected function _saveEmailTextFile($email) {
            // Verify the options were set
            if ('' == $filename = $this->_saveConfiguration[$this->_saveType]['filename']) {
                $this->_setMessage($this->_messages[self::MESSAGE_INVALID_OPTIONS], false);
                return false;
            }
            
            // Get the full path
            $path = dirname(__FILE__) . DIRECTORY_SEPARATOR . basename($filename);
            
            // Format the message
            $message = str_repeat('-', 50)
                . PHP_EOL
                . $email
                . PHP_EOL
                . str_repeat('-', 50);
            
            // Append the message
            return file_put_contents($path, file_get_contents($path) . PHP_EOL . $message);
        }
        
        /**
         * Save the e-mail in db
         * 
         * @param string $email E-mail
         */
        protected function _saveEmailDb($email) {
            // Verify the options were set
            foreach (array('db_server', 'db_name', 'db_username', 'table_name') as $key) {
                if ('' == ${$key} = $this->_saveConfiguration[$this->_saveType][$key]) {
                    $this->_setMessage($this->_messages[self::MESSAGE_INVALID_OPTIONS], false);
                    return false;
                }
            }
            
            // Set the database password
            $db_password = $this->_saveConfiguration[$this->_saveType]['db_password'];
            
            // Try to connect to the server
            if (false === mysql_connect($db_server, $db_username, $db_password)) {
                $this->_setMessage($this->_messages[self::MESSAGE_INVALID_OPTIONS], false);
                return false;
            }
            
            // Select the database
            if (false === mysql_select_db($db_name)) {
                $this->_setMessage($this->_messages[self::MESSAGE_INVALID_OPTIONS], false);
                return false;
            }
            
            // Prepare the SQL query
            $sql = sprintf(
                'INSERT INTO `%s`
                 SET `EMAIL` = \'%s\'',
                $table_name,
                mysql_real_escape_string($email)
            );
            
            // Execute it
            return (false !== mysql_query($sql));
        }
        
        /**
         * Send the e-mail by e-mail
         * 
         * @param string $email E-mail
         */
        protected function _saveEmailEmail($email) {
            // Verify the options were set
            if ('' == $to = $this->_saveConfiguration[$this->_saveType]['to']) {
                $this->_setMessage($this->_messages[self::MESSAGE_INVALID_OPTIONS], false);
                return false;
            }
            
            // Send the e-mail
            return @mail($to, 'New subscriber', str_replace(array("\r", "\n"), '', $email));
        }
        
        
        /**
         * Check if the user has posted
         * 
         * @param string $fieldName FieldName
         * @return boolean
         */
        protected function _hasPosted($fieldName=null) {
            if (null === $fieldName) {
                return isset($_POST) && !empty($_POST);
            }
            
            return isset($_POST) && isset($_POST[$fieldName]);
        }
        
    }

// Run the app
Newsletter::getInstance()->run();