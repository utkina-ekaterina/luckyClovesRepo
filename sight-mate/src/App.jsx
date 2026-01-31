import { useState } from 'react'
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import eyeLogo from'./eye.png';
import './website.css'

function App() {

  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_KEY });
  const [request, setRequest] = useState("");
  const [response, setResponse] = useState("");
  
  const handleChangeRequest = (event) => {
    setRequest(event.target.value);
  }

  async function aiURLAnalysis() {
    try {
      const aiResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You need to analyze this website: ${request}. 
          Check for <img> tags missing 'alt' attributes, having empty 'alt' strings or non-descriptive alt text (like "image123.jpg").
          Assess whether this website has low contrast text issues.
          Your response should look like this: "Score: [score from 0 to 100]. (next line) Areas to improve: (next line) 1. (one thing): (short precise explanation) ..." 
          Make sure to be precise and straight to the point. Provide a small amount of text.`
      });

      setResponse(aiResponse.text);
    } catch (error) {
      console.log(error)
      setResponse("There is some error, try again later.")
    }
  }

  async function aiScreenshotAnalysis() {
    try {
      const screenshotUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
      const base64Data = screenshotUrl.split(',')[1];

      const aiResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [`You need to analyze this website from a screenshot.
          Assess whether this website has low contrast text issues.
          Your response should look like this: "Score: [score from 0 to 100]. (next line) Areas to improve: (next line) 1. (one thing): (short precise explanation) ..." 
          Make sure to be precise and straight to the point. Provide a small amount of text.`,
        { inlineData: { data: base64Data, mimeType: "image/png" } }]
      });

      setResponse(aiResponse.text);
    } catch (error) {
      console.log(error)
      setResponse("There is some error, try again later.")
    }
  }


  return (
    <>
      <h1>S i g h t M a t e</h1>
      <div className="img-con">
        <img src={eyeLogo} className="logo"/>
      </div>
      <p>Use SightMate to fix your website to the finest!</p>
      

      <div className="con">
        <div className="searchBar">
          <input
            type="text"
            id="request"
            value={request}
            onChange={handleChangeRequest}
          />
        </div>
        <button className="go_button"
          onClick={() => {
            setResponse("Let me think...");
            aiURLAnalysis()
          }}>
          Analyse URL
        </button>

        <button className="go_button"
          onClick={() => {
            setResponse("Let me think...");
            aiScreenshotAnalysis()
          }}>
          Analyze Tab
        </button>
      </div>

      <div className='response'>
        <ReactMarkdown>{response}</ReactMarkdown>
      </div>
    </>
  );
}

export default App;
