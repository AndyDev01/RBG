<?php
// В начале файла
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', 'email_errors.log'); // создаст отдельный лог-файл
error_log("Starting email send process");

// Проверяем метод запроса
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Неверный метод запроса']);
    exit;
}

// Получаем данные из формы
$name = isset($_POST['name']) ? htmlspecialchars($_POST['name']) : '';
$company = isset($_POST['company']) ? htmlspecialchars($_POST['company']) : '';
$phone = isset($_POST['phone']) ? htmlspecialchars($_POST['phone']) : '';
$email = isset($_POST['email']) ? htmlspecialchars($_POST['email']) : '';
$message = isset($_POST['message']) ? htmlspecialchars($_POST['message']) : '';

// Получаем ответ reCAPTCHA
$recaptchaResponse = isset($_POST['g-recaptcha-response']) ? $_POST['g-recaptcha-response'] : '';

// Добавляем логирование
error_log("reCAPTCHA response: " . ($recaptchaResponse ? 'получен' : 'отсутствует'));

// Проверяем, что капча заполнена
if (empty($recaptchaResponse)) {
    echo json_encode(['success' => false, 'message' => 'Пожалуйста, подтвердите, что вы не робот']);
    exit;
}

// Проверяем ответ от Google
$secretKey = '6Lf19y8rAAAAAFqH2ilxN6NF_vPxdmAWen9q4ij8'; // Замените на ваш секретный ключ
$url = 'https://www.google.com/recaptcha/api/siteverify';
$data = [
    'secret' => $secretKey,
    'response' => $recaptchaResponse,
    'remoteip' => $_SERVER['REMOTE_ADDR']
];

$options = [
    'http' => [
        'header' => "Content-type: application/x-www-form-urlencoded\r\n",
        'method' => 'POST',
        'content' => http_build_query($data)
    ]
];

$context = stream_context_create($options);
$verify = file_get_contents($url, false, $context);
$captchaSuccess = json_decode($verify);

if (!$captchaSuccess->success) {
    echo json_encode(['success' => false, 'message' => 'Проверка reCAPTCHA не пройдена. Пожалуйста, попробуйте еще раз.']);
    error_log("reCAPTCHA verification failed: " . print_r($captchaSuccess, true));
    exit;
}

// Проверяем обязательные поля
if (empty($name) || empty($company) || empty($phone) || empty($email) || empty($message)) {
    echo json_encode(['success' => false, 'message' => 'Заполните все обязательные поля']);
    exit;
}

// Настройки SMTP для Яндекс.Почты
$smtp_server = "smtp.yandex.ru";
$smtp_port = 465;
$smtp_user = "info@refbg.ru"; 
$smtp_password = 'fdhyaqkzzteauwgg'; 

// Проверка и подключение PHPMailer
$phpmailer_base = __DIR__ . '/PHPMailer/src';
if (!file_exists($phpmailer_base . '/PHPMailer.php')) {
    file_put_contents(__DIR__ . '/phpmailer_error.txt', date('Y-m-d H:i:s') . ' - Файлы PHPMailer не найдены', FILE_APPEND);
    echo json_encode(['success' => false, 'message' => 'Ошибка настройки сервера']);
    exit;
}

require $phpmailer_base . '/PHPMailer.php';
require $phpmailer_base . '/SMTP.php';
require $phpmailer_base . '/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

$to = "info@refbg.ru";

// Тема письма
$subject = "Новый запрос с сайта Refbg.ru";

// Формируем содержимое письма
$body = "
<html>
<head>
    <title>Новый запрос с сайта</title>
</head>
<body>
    <h2>Информация о запросе:</h2>
    <p><strong>Имя:</strong> {$name}</p>
    <p><strong>Компания:</strong> {$company}</p>
    <p><strong>Телефон:</strong> {$phone}</p>
    <p><strong>Email:</strong> {$email}</p>
    <p><strong>Сообщение:</strong></p>
    <p>{$message}</p>
</body>
</html>
";

// Создаем экземпляр PHPMailer
$mail = new PHPMailer(true);

// Добавьте логирование входящих данных
error_log("POST data: " . print_r($_POST, true));

try {
    // Дебаг в файл
    $debugFile = __DIR__ . '/smtp_debug.txt';
    file_put_contents($debugFile, "=== " . date('Y-m-d H:i:s') . " ===\n", FILE_APPEND);
    
    // Усиленная отладка SMTP
    $mail->SMTPDebug = 3;
    $mail->Debugoutput = function($str, $level) use ($debugFile) {
        file_put_contents($debugFile, "$str\n", FILE_APPEND);
    };

    error_log("Attempting to send email to {$to}");
    // Настройки сервера
    $mail->isSMTP();
    $mail->Host = $smtp_server;
    $mail->SMTPAuth = true;
    $mail->Username = $smtp_user;
    $mail->Password = $smtp_password;
    $mail->SMTPSecure = 'ssl'; // для порта 587 используем TLS
    $mail->Port = $smtp_port;
    $mail->CharSet = 'UTF-8';

    // Получатели - используем тот же адрес
    $mail->setFrom($smtp_user, 'Refbg.ru');
    $mail->addAddress($smtp_user); // отправляем на info@refbg.ru
    $mail->addReplyTo($email, $name); // ответ будет на email отправителя формы

    // Содержимое
    $mail->isHTML(true);
    $mail->Subject = $subject;
    $mail->Body = $body;

    // Добавляем вложение, если оно есть
    if (isset($_FILES['attachment']) && $_FILES['attachment']['error'] == 0) {
        $mail->addAttachment($_FILES['attachment']['tmp_name'], $_FILES['attachment']['name']);
    }

    // Отправляем
    $mail->send();
    error_log("Email sent successfully");
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    error_log("FULL ERROR DETAILS: " . print_r($e, true));
    error_log("SMTP DEBUG INFO: " . $mail->SMTPDebug);
    error_log("Mailer Error: " . $mail->ErrorInfo);
    // В блок catch добавьте:
    file_put_contents(__DIR__ . '/mail_debug.txt', date('Y-m-d H:i:s') . " - Ошибка: " . $mail->ErrorInfo . "\n" . print_r($e, true) . "\n\n", FILE_APPEND);
    echo json_encode([
        'success' => false, 
        'message' => 'Ошибка: ' . $mail->ErrorInfo,
        'details' => (string)$e
    ]);
}
?> 

<div class="file-name">Файл не выбран</div> 