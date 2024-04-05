document.addEventListener("DOMContentLoaded", function () {
    let imageInput = document.getElementById('imageInput');
    let widthInput = document.getElementById('widthInput');
    let heightInput = document.getElementById('heightInput');
    let detailRange = document.getElementById('detailRange');
    let asciiArt = document.getElementById('asciiArt');
    let redRange = document.getElementById('redRange');
    let greenRange = document.getElementById('greenRange');
    let blueRange = document.getElementById('blueRange');
    let bgColorInput = document.getElementById('bgColorInput');
    let textColorInput = document.getElementById('textColorInput');
    let resetStylesButton = document.getElementById('resetStylesButton');
    let applyCustomCharsButton = document.getElementById('applyCustomCharsButton');
    let customCharsInput = document.getElementById('customCharsInput');

// Restricción ancho y alto máximo a 1500
widthInput.addEventListener('input', function () {
    if (parseInt(widthInput.value) > 1500) {
        widthInput.value = "1500";
    }
    generateAscii();
});

heightInput.addEventListener('input', function () {
    if (parseInt(heightInput.value) > 1500) {
        heightInput.value = "1500";
    }
    generateAscii();
});

    // Cargar la configuración de colores
    let savedConfig = JSON.parse(localStorage.getItem('asciiConfig'));
    if (savedConfig) {
        widthInput.value = savedConfig.width;
        heightInput.value = savedConfig.height;
        detailRange.value = savedConfig.fontSize;
        redRange.value = savedConfig.red;
        greenRange.value = savedConfig.green;
        blueRange.value = savedConfig.blue;
        bgColorInput.value = savedConfig.bgColor;
        textColorInput.value = savedConfig.textColor;
        updateBackground();
        updateTextColor();
    } else {
        // Establecer valores predeterminados solo si no hay configuración guardada
        widthInput.value = "600";
        heightInput.value = "600";
        detailRange.value = "20";
        redRange.value = "210";
        greenRange.value = "200";
        blueRange.value = "220";
        bgColorInput.value = "#E4E9F5";
        textColorInput.value = "#000000";
    }

    // Eventos
    imageInput.addEventListener('change', generateAscii); // Cambio de imagen
    widthInput.addEventListener('input', generateAscii); // Cambio de ancho de lienzo
    heightInput.addEventListener('input', generateAscii); // Cambio de alto de lienzo
    detailRange.addEventListener('input', generateAscii); // Cambio de tamaño de fuente
    redRange.addEventListener('input', generateAscii); // Cambio de valor de rojo
    greenRange.addEventListener('input', generateAscii); // Cambio de valor de verde
    blueRange.addEventListener('input', generateAscii); // Cambio de valor de azul
    bgColorInput.addEventListener('input', updateBackground); // Cambio de color de fondo
    textColorInput.addEventListener('input', function () {
        updateTextColor();
        generateAscii();
    }); // Cambiar color del texto
    resetStylesButton.addEventListener('click', resetStyles); // Resetear estilos

    // Aplicar caracteres personalizados al hacer clic en el botón "Apply"
    applyCustomCharsButton.addEventListener('click', function () {
        generateAscii();
    });

    // Generar el ASCII
    function generateAscii() {
        let imageFile = imageInput.files[0];
        let reader = new FileReader();
        reader.onload = function () {
            let img = new Image();
            img.onload = function () {
                let canvas = document.createElement('canvas');
                let ctx = canvas.getContext('2d');
                canvas.width = parseInt(widthInput.value, 10);
                canvas.height = parseInt(heightInput.value, 10);
                ctx.fillStyle = bgColorInput.value;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                asciiArt.innerHTML = getImageAscii(imageData, parseInt(detailRange.value, 10), customCharsInput.value); // Pasamos los caracteres personalizados como argumento
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(imageFile);

        // Guardar la configuración de colores
        saveConfig();
    }

    // Función para convertir la imagen en ASCII
    function getImageAscii(imageData, fontSize, customChars) {
        const chars = customChars.length > 0 ? customChars.split('') : [' ', '.', ':', '-', '=', '+', '*', '#', '%', '@']; // Convertimos la cadena de caracteres en un array
        let asciiArt = '';
        const numCustomChars = chars.length;
        for (let i = 0; i < imageData.height; i += fontSize / 2) {
            for (let j = 0; j < imageData.width; j += fontSize / 2) {
                let pixelData = getPixelData(imageData, j, i);
                let brightness = getBrightness(pixelData);
                let charIndex = Math.floor((brightness / 255) * (numCustomChars - 1));
                asciiArt += `<span style="color: ${textColorInput.value}; text-shadow: 1px 1px 2px rgba(0,0,0,0.);">${chars[charIndex]}</span>`;
            }
            asciiArt += '<br>';
        }
        asciiArt = `<div style="color: ${textColorInput.value};">${asciiArt}</div>`;
        return asciiArt;
    }

    // Obtener de pixeles de la imagen
    function getPixelData(imageData, x, y) {
        let index = (y * imageData.width + x) * 4;
        return [
            imageData.data[index], // Valor de rojo
            imageData.data[index + 1], // Valor de verde
            imageData.data[index + 2] // Valor de azul
        ];
    }

    // obtener el brillo RGB
    function getBrightness(pixelData) {
        return (pixelData[0] * (parseInt(redRange.value) / 255) +
            pixelData[1] * (parseInt(greenRange.value) / 255) +
            pixelData[2] * (parseInt(blueRange.value) / 255)) / 3;
    }

    // Cambiar color de fondo
    function updateBackground() {
        document.body.style.backgroundColor = bgColorInput.value;
    }

    // Cambiar color de texto
    function updateTextColor() {
        asciiArt.style.color = textColorInput.value;
    }

    // Resetear estilos
    function resetStyles() {
        // SweetAlert para confirmar reset
        Swal.fire({
            title: 'Are you sure?',
            text: "This will reset all styles to default values!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#4628c9',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, reset',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            // confirmar reseteo
            if (result.isConfirmed) {
                // Restaurar valores predeterminados
                widthInput.value = "600";
                heightInput.value = "600";
                detailRange.value = "20";
                redRange.value = "210";
                greenRange.value = "200";
                blueRange.value = "220";
                bgColorInput.value = "#E4E9F5";
                textColorInput.value = "#000000";
                customCharsInput.value = ' .: -+=*#%@'; // Establecer caracteres predeterminados

                // Actualizar estilos
                updateBackground();
                updateTextColor();
                generateAscii();

                // Limpiar la configuración guardada
                localStorage.removeItem('asciiConfig');

                // Notificación de éxito
                Swal.fire(
                    '¡Restored!',
                    'Styles have been reset to default values.',
                    'success'
                );
            }
        });
    }

    // Guardar la configuración de colores en el almacenamiento web
    function saveConfig() {
        let config = {
            width: widthInput.value,
            height: heightInput.value,
            fontSize: detailRange.value,
            red: redRange.value,
            green: greenRange.value,
            blue: blueRange.value,
            bgColor: bgColorInput.value,
            textColor: textColorInput.value
        };
        localStorage.setItem('asciiConfig', JSON.stringify(config));
    }
});
