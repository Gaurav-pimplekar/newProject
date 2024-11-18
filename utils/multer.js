import multer from "multer";

const storage = multer.diskStorage({
  filename:async (req, file, cb)=>{
    cb(null, Date.now() + file.originalname);
  },
  destination:async (req, file, cb)=>{
    cb(null, "photos/")
  }
})


const upload = multer({storage});

export default upload