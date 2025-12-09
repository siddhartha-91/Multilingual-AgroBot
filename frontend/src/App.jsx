import { useState } from "react";

const speak = (text, lang) => {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = { en:"en-IN", te:"te-IN", hi:"hi-IN", kn:"kn-IN" }[lang];
  speechSynthesis.speak(u);
};

const listen = (setText, lang) => {
  const R = window.SpeechRecognition || window.webkitSpeechRecognition;
  const r = new R();
  r.lang = { en:"en-IN", te:"te-IN", hi:"hi-IN", kn:"kn-IN" }[lang];
  r.onresult = e => setText(e.results[0][0].transcript);
  r.start();
};

export default function App() {
  const [file,setFile]=useState();
  const [res,setRes]=useState();
  const [msg,setMsg]=useState("");
  const [lang,setLang]=useState("en");
  const [ans,setAns]=useState("");

  const analyze = async()=>{
    const fd=new FormData();
    fd.append("file",file);
    const r=await fetch("http://127.0.0.1:8000/predict",{method:"POST",body:fd});
    setRes(await r.json());
  };

  const ask=async()=>{
    const r=await fetch("http://127.0.0.1:8000/chat",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({...res,message:msg,language:lang})
    });
    const d=await r.json();
    setAns(d.reply);
    speak(d.reply,lang);
  };

  return (
    <div style={{padding:20}}>
      <h1>🌱 KissanAI</h1>

      <input type="file" onChange={e=>setFile(e.target.files[0])}/>
      <button onClick={analyze}>Analyze</button>

      {res && <>
        <p><b>Crop:</b> {res.crop}</p>
        <p><b>Disease:</b> {res.disease}</p>
        <p><b>Confidence:</b> {res.confidence}%</p>

        <select onChange={e=>setLang(e.target.value)}>
          <option value="en">English</option>
          <option value="te">తెలుగు</option>
          <option value="hi">हिंदी</option>
          <option value="kn">ಕನ್ನಡ</option>
        </select>

        <input value={msg} onChange={e=>setMsg(e.target.value)} />
        <button onClick={()=>listen(setMsg,lang)}>🎙️ Speak</button>
        <button onClick={ask}>Ask</button>

        {ans && <p>🤖 {ans}</p>}
      </>}
    </div>
  );
}
