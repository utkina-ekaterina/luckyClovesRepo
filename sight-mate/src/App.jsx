import { useState } from 'react'
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import eyeLogo from './eye.png';
import './website.css'

function App() {

  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_KEY });
  const [response, setResponse] = useState("");

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
          return await axe.run({
            runOnly: {
              type: 'tag',
              values: ['wcag2aa', 'contrast']
            }
          });
        }
      });

      if (results && results[0]?.result) {
        const violations = results[0].result.violations;
        const manualChecks = results[0].result.incomplete;
        const allIssues = [...violations, ...manualChecks];

        if (allIssues.length === 0) {
          setResponse("No automated violations found! Great job.");
        } else {
          highlightViolations(allIssues);
          const aiResponse = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `I found these accessibility issues: ${JSON.stringify(allIssues)}. 
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
                border: '3px dashed #f4a630ff',
                backgroundColor: 'rgba(235, 168, 97, 0.05)',
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

  async function clearHighlights() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab) return;

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Find all elements with the class we created earlier
          const highlights = document.querySelectorAll('.sightmate-highlight');
          highlights.forEach(el => el.remove());
        }
      });

      // Optional: Reset the AI response text if you want to "clear" the dashboard too
      // setResponse(""); 
    } catch (error) {
      console.error("Failed to clear highlights:", error);
    }
  }

  return (
    <>
      <h1>S i g h t M a t e</h1>
      <div className="img-con">
        <img src={eyeLogo} className="logo" alt='SightMate Logo' />
      </div>
      <p>Use SightMate to fix your website to the finest!</p>


      <div className="con">
        <button className="go_button"
          onClick={() => {
            setResponse("Let me think...");
            runAxeAnalysis()
          }}>
          Analyze Tab
        </button>
      </div>

<div className='response'><ReactMarkdown>{response}</ReactMarkdown></div>
      {response && <div className="con">
        <button className="go_button"
          onClick={() => {
            clearHighlights()
            setResponse("");
          }}>
          Clear
        </button>
      </div>}
    </>
  );
}

export default App;
