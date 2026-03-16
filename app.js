// app.js
const video = document.getElementById("video");
const captureBtn = document.getElementById("captureBtn");
const resultText = document.getElementById("result");

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (err) {
    resultText.innerText = "حدث خطأ عند الوصول للكاميرا: " + err;
  }
}

async function loadModels() {
  resultText.innerText = "جاري تحميل النماذج، الرجاء الانتظار...";

  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri("./facemodels/");
    await faceapi.nets.faceLandmark68Net.loadFromUri("./facemodels/");
    await faceapi.nets.faceRecognitionNet.loadFromUri("./facemodels/");

    captureBtn.style.display = "inline";
    resultText.innerText = "النماذج جاهزة، يمكنك التقاط بصمة الوجه الآن";
    console.log("النماذج جاهزة");
  } catch (err) {
    resultText.innerText = "خطأ أثناء تحميل النماذج: " + err;
    console.error(err);
  }
}

async function captureFace() {
  const empId = document.getElementById("empId").value;
  const name = document.getElementById("name").value;

  if (!empId || !name) {
    resultText.innerText = "الرجاء إدخال رقم الموظف واسم الموظف";
    return;
  }

  const detection = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    resultText.innerText = "لم يتم التعرف على الوجه. حاول وضع الوجه أمام الكاميرا بشكل واضح";
    return;
  }

  const faceVector = Array.from(detection.descriptor);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        type: "register",
        employee: empId,
        name: name,
        face: faceVector
      })
    });

    const result = await response.json();
    if (result.status === "ok") {
      resultText.innerText = "تم تسجيل الموظف بنجاح ✅";
    } else {
      resultText.innerText = "حدث خطأ أثناء التسجيل: " + result.error;
    }
  } catch (err) {
    resultText.innerText = "حدث خطأ عند الاتصال بالخادم: " + err;
    console.error(err);
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  await loadModels();
  await startCamera();
});
