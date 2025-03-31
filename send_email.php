<?php
// В начале файла
error_reporting(E_ALL);
ini_set('display_errors', 1);
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

// Проверяем обязательные поля
if (empty($name) || empty($company) || empty($phone) || empty($email) || empty($message)) {
    echo json_encode(['success' => false, 'message' => 'Заполните все обязательные поля']);
    exit;
}

// Настройки SMTP для Яндекс.Почты
$smtp_server = "smtp.yandex.ru";
$smtp_port = 465;
$smtp_user = "noreply@refbg.ru"; // Введите реальный адрес
$smtp_password = "RbG$2025"; // Введите реальный пароль

// Используем PHPMailer для отправки
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';
require 'PHPMailer/src/Exception.php';

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

try {
    // Настройки сервера
    $mail->isSMTP();
    $mail->Host = $smtp_server;
    $mail->SMTPAuth = true;
    $mail->Username = $smtp_user;
    $mail->Password = $smtp_password;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // для порта 465
    $mail->Port = $smtp_port;
    $mail->CharSet = 'UTF-8';

    // Получатели
    $mail->setFrom($smtp_user, 'РБГ Сайт');
    $mail->addAddress($to);
    $mail->addReplyTo($email, $name);

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
    error_log("Mailer Error: " . $mail->ErrorInfo);
    echo json_encode(['success' => false, 'message' => 'Ошибка при отправке письма: ' . $mail->ErrorInfo]);
}
?> 