   <?php
   error_reporting(E_ALL);
   ini_set('display_errors', 1);
   
   $fp = fsockopen('ssl://smtp.yandex.ru', 465, $errno, $errstr, 30);
   if (!$fp) {
       echo "Ошибка: $errno - $errstr";
   } else {
       echo "Соединение успешно!";
       fclose($fp);
   }
   ?>