<?php
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
$smtp_password = "ваш_пароль_яндекса"; // Введите реальный пароль

// Используем PHPMailer для отправки
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';
require 'PHPMailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

$to = "info@refbg.ru";

// Тема письма
$subject = "Новый запрос с сайта РБГ";

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
    $mail->SMTPDebug = 0; // 0 - отключить вывод отладочной информации, 2 - показать подробный лог
    $mail->isSMTP();
    $mail->Host = $smtp_server;
    $mail->SMTPAuth = true;
    $mail->Username = $smtp_user;
    $mail->Password = $smtp_password;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // SSL для порта 465
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
    echo json_encode(['success' => true, 'message' => 'Ваше сообщение успешно отправлено']);
} catch (Exception $e) {
    // Записываем ошибку в лог
    error_log("Ошибка отправки: " . $mail->ErrorInfo . " - " . date('Y-m-d H:i:s'), 3, "mail_error.log");
    echo json_encode(['success' => false, 'message' => 'Ошибка при отправке сообщения. Пожалуйста, попробуйте позже или свяжитесь с нами по телефону.']);
}
?> 