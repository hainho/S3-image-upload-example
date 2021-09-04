const express = require('express')

const fs = require('fs')
const util = require('util')

//파일 삭제
//fs.unlink(Path, callback)
//Path에 파일 경로 + 파일명
//두번째 콜백함수
//콜백함수엔 err을 인자로 줄수있으면 err은 에러가 발생한 경우
const unlinkFile = util.promisify(fs.unlink)

// express에 multer모듈 적용
const multer = require('multer')

// 입력한 파일이 uploads/ 폴더 내에 저장된다.
// multer라는 모듈이 함수라서 함수에 옵션을 줘서 실행을 시키면
// 해당 함수는 미들웨어를 리턴한다.
// 미들웨어 upload.single('avatar')는 뒤의 function(req, res)함수가 실행되기 전에 먼저 실행.
// 미들웨어는 사용자가 전송한 데이터 중에서 만약 파일이 포함되어 있다면,
// 그 파일을 가공해서 req객체에 file 이라는 프로퍼티를 암시적으로 추가도록 약속되어 있는 함수.
// upload.single('image') 의 매개변수 'image'는 form을 통해 전송되는 파일의 name속성을 가져야 함.
const upload = multer({ dest: 'uploads/' })

const { uploadFile, getFileStream } = require('./s3')

const app = express()

app.get('/images/:key', (req, res) => {
  console.log(req.params)
  const key = req.params.key
  const readStream = getFileStream(key)

  // pipe가 하는 일은 pipe로 stream 간에 read와 write event 들을 연결해주는 것이다.
  // 여러개의 pipe를 서로 연결하는 것도 가능
  // 리드 스트림으로 이미지 파일 읽어와서 res에 쓰기
  readStream.pipe(res)
})

// single('image')는 req.file에 'image'파일 req.file에 저장
// array('photos', 12)는 req.file에 'photos'파일이 12개 배열로 있는거 req.file에 저장
// fields([{ name: 'avatar', maxCount: 1 }, { name: 'gallery', maxCount: 8 }]) 이건 객채로 있는거 req.file에 저장
app.post('/images', upload.single('image'), async (req, res) => {
  const file = req.file
  console.log(file)

  // apply filter
  // resize 
  // sharp 사용하면 리사이징 가능

  //uploads 폴더에 있는 파일 s3에 업로드
  const result = await uploadFile(file)
  //uploads 폴더에 있는 파일 삭제
  await unlinkFile(file.path)
  console.log(result)
  //const description = req.body.description
  //s3에 저장한 이미지 경로 send
  res.send({imagePath: `/images/${result.Key}`})
})

app.listen(8080, () => console.log("listening on port 8080"))