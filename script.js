const fileInput = document.getElementById("fileInput");

const fileSection = document.getElementById("fileSection");

const fileName = document.getElementById("fileName");
const fileSize = document.getElementById("fileSize");

const hashValue = document.getElementById("hashValue");

const baselineButton =
    document.getElementById("baselineButton");

const compareButton =
    document.getElementById("compareButton");

const copyButton =
    document.getElementById("copyButton");

const statusBox =
    document.getElementById("statusBox");

const statusIcon =
    document.getElementById("statusIcon");

const statusTitle =
    document.getElementById("statusTitle");

const statusMessage =
    document.getElementById("statusMessage");


let currentFile = null;

let currentHash = null;

let baselineHash = null;


/*
    Convert bytes into a readable file size.
*/

function formatFileSize(bytes) {

    if (bytes < 1024) {
        return bytes + " Bytes";
    }

    if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(2) + " KB";
    }

    if (bytes < 1024 * 1024 * 1024) {
        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    }

    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
}


/*
    Generate SHA-256 hash using
    the browser's Web Crypto API.
*/

async function generateSHA256(file) {

    const buffer = await file.arrayBuffer();

    const hashBuffer =
        await crypto.subtle.digest(
            "SHA-256",
            buffer
        );

    const hashArray =
        Array.from(
            new Uint8Array(hashBuffer)
        );

    const hashHex =
        hashArray
            .map(byte =>
                byte.toString(16).padStart(2, "0")
            )
            .join("");

    return hashHex;
}


/*
    File selection
*/

fileInput.addEventListener("change", async function () {

    const file = fileInput.files[0];

    if (!file) {
        return;
    }

    currentFile = file;

    currentHash = null;

    fileSection.classList.remove("hidden");

    statusBox.classList.add("hidden");

    fileName.textContent = file.name;

    fileSize.textContent =
        formatFileSize(file.size);

    hashValue.textContent =
        "Calculating SHA-256...";

    baselineButton.disabled = true;

    compareButton.disabled = true;


    try {

        currentHash =
            await generateSHA256(file);

        hashValue.textContent =
            currentHash;

        baselineButton.disabled = false;

        compareButton.disabled = false;

    } catch (error) {

        hashValue.textContent =
            "Unable to calculate hash.";

        console.error(error);
    }

});


/*
    Set current hash as baseline.
*/

baselineButton.addEventListener("click", function () {

    if (!currentHash) {
        return;
    }

    baselineHash = currentHash;

    showStatus(
        "success",
        "✓",
        "Baseline Created",
        "This SHA-256 hash has been saved as the integrity baseline for this session."
    );

});


/*
    Compare current hash with baseline.
*/

compareButton.addEventListener("click", function () {

    if (!baselineHash) {

        showStatus(
            "danger",
            "!",
            "No Baseline Found",
            "Create a baseline first before comparing the file."
        );

        return;
    }


    if (currentHash === baselineHash) {

        showStatus(
            "success",
            "✓",
            "Integrity Verified",
            "The current SHA-256 hash matches the baseline. No changes were detected."
        );

    } else {

        showStatus(
            "danger",
            "!",
            "File Modified",
            "The current SHA-256 hash does not match the baseline. The file contents have changed."
        );

    }

});


/*
    Display status message.
*/

function showStatus(
    type,
    icon,
    title,
    message
) {

    statusBox.classList.remove(
        "hidden",
        "success",
        "danger"
    );

    statusBox.classList.add(type);

    statusIcon.textContent = icon;

    statusTitle.textContent = title;

    statusMessage.textContent = message;
}


/*
    Copy SHA-256 hash.
*/

copyButton.addEventListener("click", async function () {

    if (!currentHash) {
        return;
    }

    try {

        await navigator.clipboard.writeText(
            currentHash
        );

        copyButton.textContent = "Copied!";

        setTimeout(function () {

            copyButton.textContent = "Copy";

        }, 1500);

    } catch (error) {

        copyButton.textContent = "Copy failed";

        setTimeout(function () {

            copyButton.textContent = "Copy";

        }, 1500);

    }

});
