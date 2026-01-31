import { useState } from 'react'
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
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

async function runAxeAnalysis() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["axe.min.js"]
    });

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async () => {
        return await axe.run();
      }
    });

    if (results && results[0]?.result) {
      const violations = results[0].result.violations;
      
      if (violations.length === 0) {
        setResponse("No automated violations found! Great job.");
      } else {
        highlightViolations(violations);
        const aiResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `I found these accessibility issues: ${JSON.stringify(violations)}. 
        You need to provide precise and straight and small suggestions how to fix those issues. Provide a score of accessibility.
        If possible, provide lines of code where the issue appears, or the snippet of the code. Please, be precise, remember, you are
        outlining this in a chrome extention.
        Please remove any headers and unnecessary things. Please, be precise. No tables. Follow this format:
        Format your response with clear Markdown.
    
        Score: [0-100]
        ---
        ### Issue 1: [Name]
        **Current Code:** \`\`\`html
        [html snippet here]
         \`\`\`
         **Suggested Fix:**
        \`\`\`html
        [fixed snippet here]
        \`\`\`
        ---
        (Repeat for other issues)
        No explanations. real fixes.
        `
      });

      setResponse(aiResponse.text);
      }
    }
  } catch (error) {
    console.error("Analysis failed:", error);
    setResponse("Make sure you are on a valid webpage and try again.");
  }
}

async function highlightViolations(violations) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (violationsData) => {
      const old = document.querySelectorAll('.sightmate-highlight');
      old.forEach(el => el.remove());

      violationsData.forEach(violation => {
        violation.nodes.forEach(node => {
          const el = document.querySelector(node.target[0]);
          if (el) {
            const rect = el.getBoundingClientRect();
            const highlight = document.createElement('div');
            
            Object.assign(highlight.style, {
              position: 'absolute',
              top: `${rect.top + window.scrollY}px`,
              left: `${rect.left + window.scrollX}px`,
              width: `${rect.width}px`,
              height: `${rect.height}px`,
              border: '3px dashed #ff4757',
              backgroundColor: 'rgba(255, 71, 87, 0.1)',
              pointerEvents: 'none',
              zIndex: '9999',
              borderRadius: '4px'
            });
            
            highlight.className = 'sightmate-highlight';
            document.body.appendChild(highlight);
          }
        });
      });
    },
    args: [violations]
  });
}

  return (
    <>
      <h1>S i g h t M a t e</h1>
      <p>SightMate is an AI bot that helps analyze any website to make them more accessible for users with disabilities.</p>
      <p>Input the website link or choose to analyse the current website</p>

      <div className="con">
        <button className="go_button"
          onClick={() => {
            setResponse("Let me think...");
            runAxeAnalysis()
          }}>
          Analyze the current website
        </button>
      </div>

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
          Analyse the URL
        </button>
      </div>

      <div className='response'>
        <ReactMarkdown>{response}</ReactMarkdown>
      </div>
    </>
  )
}

export default App
