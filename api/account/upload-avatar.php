<?php
declare(strict_types=1);
require __DIR__ . '/../_bootstrap.php';

$userId = require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
    json_error('No se ha podido subir la imagen. Prueba con otro archivo (máx. 2 MB).');
}

$file = $_FILES['avatar'];
if ($file['size'] > 2 * 1024 * 1024) {
    json_error('La imagen no puede pesar más de 2 MB');
}

$allowedTypes = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
];

// getimagesize() no depende de la extensión fileinfo (no siempre disponible
// en todos los hostings) y de paso confirma que el archivo es una imagen real.
$imageInfo = @getimagesize($file['tmp_name']);
if ($imageInfo === false || !isset($allowedTypes[$imageInfo['mime']])) {
    json_error('La imagen debe ser JPG, PNG o WEBP');
}
$extension = $allowedTypes[$imageInfo['mime']];

// Se guarda fuera de api/, ya que deploy.sh borra y reemplaza esta carpeta
// entera en cada despliegue — así el avatar sobrevive a futuras versiones.
$uploadsDir = __DIR__ . '/../../uploads/avatars';
if (!is_dir($uploadsDir)) {
    mkdir($uploadsDir, 0755, true);
}

// Borra cualquier avatar anterior (puede tener otra extensión).
foreach ($allowedTypes as $ext) {
    $old = $uploadsDir . '/' . $userId . '.' . $ext;
    if (is_file($old)) {
        unlink($old);
    }
}

$destination = $uploadsDir . '/' . $userId . '.' . $extension;
if (!move_uploaded_file($file['tmp_name'], $destination)) {
    json_error('No se ha podido guardar la imagen', 500);
}

$avatarPath = '/uploads/avatars/' . $userId . '.' . $extension . '?v=' . time();

$stmt = $pdo->prepare('UPDATE users SET avatar_path = ? WHERE id = ?');
$stmt->execute([$avatarPath, $userId]);

json_response(['user' => user_response($pdo, $userId)]);
