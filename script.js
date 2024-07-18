const generateForm = document.querySelector(".generator-form");
const imageGallery = document.querySelector(".image-gallery");
const OPENAI_API_KEY = "sk-None-jm2aeDP6OzSqesW1sX5HT3BlbkFJHm5Junmpth6XOeXHex2w";

const updateImageCard = (imgDataArray) => {
    imgDataArray.forEach((imgObject, index) => {
        const imgCards = imageGallery.querySelectorAll(".img-card");
        if (imgCards[index]) {
            const imgElement = imgCards[index].querySelector("img");
            const aiGeneratedImg = `data:image/jpeg;base64,${imgObject.b64_json}`;
            imgElement.src = aiGeneratedImg;
            imgElement.onload = () => {
                imgCards[index].classList.remove("loading");
            };
        }
    });
};

const generateAiImages = async (userPrompt, userImgQuantity) => {
    try {
        console.log("Generating AI images with prompt:", userPrompt, "and quantity:", userImgQuantity);
        const response = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                prompt: userPrompt,
                n: parseInt(userImgQuantity, 10),
                size: "512x512",
                response_format: "b64_json"
            })
        });
        console.log("Response status:", response.status);
        if (!response.ok) {
            const errorDetails = await response.json();
            console.log("Error details:", errorDetails);
            throw new Error(errorDetails.error.message || "Failed to generate image! Please try again.");
        }
        const { data } = await response.json();
        console.log("Received data:", data);
        updateImageCard(data);
    } catch (error) {
        alert(error.message);
    }
};

const displayImages = (images) => {
    const imgCardMarkup = images.map(image => `
        <div class="img-card">
            <img src="data:image/png;base64,${image.b64_json}" alt="AI generated image">
            <a href="data:image/png;base64,${image.b64_json}" download="generated-image.png" class="download-btn">
                <img src="downloadicon.png" alt="download icon">
            </a>
        </div>
    `).join("");
    imageGallery.innerHTML = imgCardMarkup;
};

const handleFormSubmission = (e) => {
    e.preventDefault();
    const userPrompt = e.target[0].value.trim();
    const userImgQuantity = e.target[1].value.trim();

    if (!userPrompt || !userImgQuantity || isNaN(userImgQuantity) || userImgQuantity <= 0) {
        alert("Please enter a valid prompt and a positive number of images.");
        return;
    }

    const imgCardMarkup = Array.from({ length: userImgQuantity }, () =>
        `<div class="img-card loading">
            <img src="loading.gif" alt="image">
            <a href="#" class="download-btn">
                <img src="downloadicon.png" alt="download icon">
            </a>
        </div>`
    ).join("");
    imageGallery.innerHTML = imgCardMarkup;
    generateAiImages(userPrompt, userImgQuantity);
};

generateForm.addEventListener("submit", handleFormSubmission);
