var uploadImage = document.getElementById('uploadImage');
var uploadedImage = document.getElementById('uploadedImage');
var btnGrayscale = document.getElementById('btnGrayScale');
var btnHistogramEquilizer = document.getElementById('btnHistogramEquilizer');
var myCanvas = document.getElementById('myCanvas');
var canvasContext;
var imgData;
var pixels = [];
var historicalpixels = [];

uploadImage.addEventListener('change', () =>{
    if(uploadImage.files[0]){
        uploadedImage.src = URL.createObjectURL(uploadImage.files[0]);
    }
    else{
        uploadedImage.src = "";
    }
});

btnGrayscale.addEventListener('click', () => {
    let cumilativeCount = 0;
    let grayscaleValue = 0;
    myCanvas.width = uploadedImage.width;
    myCanvas.height = uploadedImage.height;
    canvasContext = myCanvas.getContext("2d");
    canvasContext.drawImage(uploadedImage,0,0);
    imgData = canvasContext.getImageData(0, 0, myCanvas.width, myCanvas.height);
    console.log(imgData);
    for(let i=0;i<imgData.data.length;i+=4){
        grayscaleValue = (imgData.data[i] + imgData.data[i+1] + imgData.data[i+2])/3;
        imgData.data[i] = grayscaleValue;
        imgData.data[i+1] = grayscaleValue;
        imgData.data[i+2] = grayscaleValue;
        imgData.data[i+3] = 255;
        pixels.push(new PixelOfImage(cumilativeCount++,grayscaleValue));
    }
    canvasContext.putImageData(imgData,0,0);
})

btnHistogramEquilizer.addEventListener('click', () =>{
    let finalData = [];
    let hisPixel;
    let indx=0
    pixels.forEach(sPixel => {
        if(doesPixelIntensityExists(sPixel.intensity) == false){
            historicalpixels.push(new HistoricalPixel(sPixel.intensity,getCumilative(sPixel.intensity)));
        }
    });
    let minCDF = Math.min.apply(Math, historicalpixels.map(function (o) {
        return o.cumilative;
    }));
    historicalpixels.forEach(hPixel => {
        hPixel.applyhistoricalEquilization(minCDF);
    });
    pixels.forEach(sp => {
        hisPixel = getHistoricalPixel(sp);
        imgData.data[indx++] = hisPixel.historicalScale;
        imgData.data[indx++] = hisPixel.historicalScale;
        imgData.data[indx++] = hisPixel.historicalScale;
        imgData.data[indx++] = 255;
    });
    canvasContext.putImageData(imgData, 0, 0);
})

class PixelOfImage{
    constructor(position,intensity){
        this.position = position;
        this.intensity = intensity;
    }
}

class HistoricalPixel{
    constructor(intensity, cumilative){
        this.intensity = intensity;
        this.cumilative = cumilative;
        this.historicalScale = null;
    }

    applyhistoricalEquilization(minCumilative){
        this.historicalScale =  Math.round(((this.cumilative - minCumilative) * (historicalpixels.length-1))/(pixels.length-minCumilative));
        console.log(this.intensity, this.cumilative, this.historicalScale);
    }
}

function doesPixelIntensityExists(intensity){
    if(historicalpixels.length == 0){
        return false;
    }
    return historicalpixels.some((hPixel) => {
        return (hPixel.intensity == intensity);
    })
}

function getCumilative(intensity){
    var filteredPixels = pixels.filter((sPixel) =>{
        return sPixel.intensity == intensity;
    })
    return filteredPixels.length;
}

function getHistoricalPixel(pixel){
    return historicalpixels.filter((hPixel)=>{
        return hPixel.intensity == pixel.intensity;
    })[0];
}