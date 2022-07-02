const dropZone = document.querySelector(".drop-zone");
const fileInput =  document.querySelector("#fileInput")
const browseBtn =  document.querySelector(".browseBtn")
const percentDiv = document.querySelector('#percent')
const bgProgress = document.querySelector('.bg-progress');
const progressBar = document.querySelector('.progress-bar'); 
const progressContainer = document.querySelector('.progress-container');
const fileURL = document.querySelector('#fileURL');
const sharingContainer = document.querySelector('.sharing-container');
const coptBtn = document.querySelector('#copyBtn');
const emailForm = document.querySelector('#emaiForm');
const toast = document.querySelector('#toast');
const maxAllowedSize = 100 * 1024 * 1024
const host = "https://innshare.herokuapp.com";
const uploadURL = `${host}/api/files`
const emailURL = `${host}/api/files/send`

if(dropZone)
dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
  if (!dropZone.classList.contains("dragged")) {
    dropZone.classList.add("dragged");
  }
});
if(coptBtn)
coptBtn.addEventListener('click', () => {
    fileURL.select();

    document.execCommand('copy');
    showToast("Link copied")
})

if(dropZone)
dropZone.addEventListener('dragleave', ()=> {
    dropZone.classList.remove('dragged');
})

if(dropZone)
dropZone.addEventListener('drop', (e)=> {
    e.preventDefault();
    dropZone.classList.remove('dragged');
    // console.log(e);
    const files = e.dataTransfer.files;
    if(files.length)
        fileInput.files = files;

        uploadFile();

})
if(fileInput)
fileInput.addEventListener("change", () => {
    uploadFile();
})
if(browseBtn)
browseBtn.addEventListener('click', () => {
    fileInput.click();
})

const uploadFile = () => {
    if(fileInput.files.length > 1) {
        fileInput.value = ""
        showToast("Only upload 1 file");
        return;
    }
    progressContainer.style.display = "block";

    const file = fileInput.files[0];
    // if(file.size > maxAllowedSize) {
    //     showToast("Can't upload more than 100MB")
    //     fileInput.val = ""
    //     return;
    // }
    const formData = new FormData();
    formData.append("myfile", file);
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        // console.log(xhr.readyState);
        if(xhr.readyState === XMLHttpRequest.DONE) {
         console.log(xhr.response);
         showLink(JSON.parse(xhr.readyState));  
        }
        
    };

    xhr.upload.onprogress = updateProgress;
    xhr.upload.onerror = () => {
        fileInput.value = ""
        showToast(`Error in upload: ${xhr.statustext}`)

    }
    
    xhr.open("post", uploadURL);
    xhr.send(formData)
};
const updateProgress = (e) => {

    const percent = Math.round((e.loaded/e.total) * 100);
    console.log(percent);
 
    bgProgress.style.width = `${percent}%`;
   
    percentDiv.innerText = `${percent}`
    progressBar.style.width = `${percent}%`
    // progressContainer.style.display = "none";
}
let toastTimer;
const showToast = (msg) => {
    toast.innerText = msg;
    toast.style.transform = "translate(-50%,0)";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=> {
        toast.style.transform = "translate(-50%,60px)"
    }, 2000);
}

const showLink = ({file : url}) => {
    fileInput.value == ""
    emailForm[2].removeAttribute("disabled")

    progressContainer.style.display = "none";
    sharingContainer.style.display = "block";
    console.log(url);
    sharingContainer.style.display = "block"
    fileURL.value = url;
    
}
if(emailForm)
emailForm.addEventListener('submit', (e) => {
     e.preventDefault();
     console.log('submit form');
     const url = fileURL.value;
     const formData = {
         uuid : url.split('/').splice(-1, 1)[0],
         emailTo : emailForm.elements("to-email").value,
         emailForm :emailForm.elements("from-email").value
     };
     console.table(formData);

     emailForm[2].setAttribute("disabled", "true")
     fetch(emailURL, {
        method : "POST",
        headers : {
            "Content-Type" : "application/json"
        },
        body : JSON.stringify(formData)
     }).then(res => res.json())
       .then(({success}) => {
        if(success) {
            sharingContainer.style.display = "none"
            showToast("Email sent");
        }
     })
})

