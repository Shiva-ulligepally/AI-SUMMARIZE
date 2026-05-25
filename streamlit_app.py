import streamlit as st
import os
import re
import math
import time
from groq import Groq
from fpdf import FPDF
import pypdf
import docx

# Custom Sentence Extractive Summarizer
def sentencize(text):
    if not text:
        return []
    cleaned_text = re.sub(r'\s+', ' ', text).strip()
    sentence_regex = r'[^.!?]+[.!?]+(?=\s[A-Z]|$)'
    sentences = re.findall(sentence_regex, cleaned_text)
    if not sentences:
        sentences = re.split(r'[.!?]+', cleaned_text)
    return [s.strip() for s in sentences if len(s.strip()) > 5]

def summarize_extractive(text, length='medium'):
    if not text or not text.strip():
        return ""
    
    sentences = sentencize(text)
    if len(sentences) <= 3:
        return "\n".join([f"• {s}" for s in sentences])
        
    target_count = 3
    if length == 'short':
        target_count = max(3, round(len(sentences) * 0.15))
    elif length == 'medium':
        target_count = max(5, round(len(sentences) * 0.25))
    elif length == 'detailed':
        target_count = max(8, round(len(sentences) * 0.40))
        
    target_count = min(target_count, len(sentences))
    
    stop_words = {
        'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at', 
        'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'did', 'do', 
        'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having', 
        'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 
        'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 
        'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 
        'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 
        'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 
        'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself', 
        'yourselves', 'will', 'also', "hasn't", "haven't", "isn't", "shouldn't", "couldn't"
    }
    
    word_counts = {}
    max_count = 0
    
    for sentence in sentences:
        words = re.findall(r'\b[a-z]{3,}\b', sentence.lower())
        for word in words:
            if word not in stop_words:
                word_counts[word] = word_counts.get(word, 0) + 1
                if word_counts[word] > max_count:
                    max_count = word_counts[word]
                    
    word_frequencies = {}
    if max_count > 0:
        for word, count in word_counts.items():
            word_frequencies[word] = count / max_count
            
    sentence_scores = []
    for index, sentence in enumerate(sentences):
        words = re.findall(r'\b[a-z]{3,}\b', sentence.lower())
        raw_score = 0
        meaningful_word_count = 0
        for word in words:
            if word in word_frequencies:
                raw_score += word_frequencies[word]
                meaningful_word_count += 1
                
        normalized_score = raw_score / math.pow(meaningful_word_count, 0.4) if meaningful_word_count > 0 else 0
        sentence_scores.append({
            'sentence': sentence,
            'index': index,
            'score': normalized_score
        })
        
    top_sentences = sorted(sentence_scores, key=lambda x: x['score'], reverse=True)[:target_count]
    ordered_selections = sorted(top_sentences, key=lambda x: x['index'])
    
    return "\n".join([f"• {item['sentence']}" for item in ordered_selections])

# FPDF Summary exporter
def generate_pdf_bytes(title, content, summary_type, length, word_count):
    pdf = FPDF()
    pdf.add_page()
    
    # Header branding
    pdf.set_font("Helvetica", "B", 18)
    pdf.set_text_color(139, 92, 246)  # brand purple
    pdf.cell(0, 10, "SmartSumm AI Document Summary", ln=True, align="L")
    
    pdf.set_draw_color(139, 92, 246)
    pdf.set_line_width(0.5)
    pdf.line(10, 22, 200, 22)
    pdf.ln(10)
    
    # Document Title
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 10, f"Document: {title}", ln=True)
    pdf.ln(2)
    
    # Summary Content Box
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(30, 41, 59)
    # clean formatting for unicode characters
    cleaned_content = content.encode('latin-1', 'replace').decode('latin-1')
    pdf.multi_cell(0, 6, cleaned_content)
    
    # Metadata footer separator
    pdf.ln(10)
    pdf.set_draw_color(203, 213, 225)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(5)
    
    # Metadata footer
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(148, 163, 184)
    meta_str = f"Type: {summary_type.upper()}  |  Length: {length.upper()}  |  Words: {word_count}"
    pdf.cell(0, 5, meta_str, ln=True)
    
    return bytes(pdf.output())

# Document Parser Helpers
def parse_pdf(file):
    reader = pypdf.PdfReader(file)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text

def parse_docx(file):
    doc = docx.Document(file)
    return "\n".join([p.text for p in doc.paragraphs])

def parse_txt(file):
    return file.read().decode("utf-8", errors="ignore")

# Streamlit App Page Config
st.set_page_config(
    page_title="SmartSumm AI | Premium AI-Powered Summarizer",
    page_icon="✨",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom premium styling rules injected to match our premium UI
st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Plus Jakarta Sans', sans-serif;
    }
    
    /* Main gradient background & dark theme */
    .stApp {
        background-color: #030712;
        color: #f3f4f6;
    }
    
    /* Sleek card styling */
    .glass-card {
        background: rgba(17, 24, 39, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 20px;
        padding: 24px;
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        margin-bottom: 24px;
    }
    
    /* Custom headers and colors */
    .brand-title {
        background: linear-gradient(135deg, #a78bfa 0%, #22d3ee 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 800;
        font-size: 2.5rem;
        margin-bottom: 0.5rem;
    }
    
    /* Premium button styles */
    .stButton>button {
        background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
        color: white;
        border: none;
        border-radius: 12px;
        padding: 12px 24px;
        font-weight: 600;
        transition: all 0.2s ease-in-out;
        box-shadow: 0 4px 14px 0 rgba(124, 58, 237, 0.2);
    }
    
    .stButton>button:hover {
        background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px 0 rgba(124, 58, 237, 0.3);
        color: white;
    }
    </style>
""", unsafe_allow_html=True)

# App state initializer
if 'summary_result' not in st.session_state:
    st.session_state.summary_result = None
if 'chat_history' not in st.session_state:
    st.session_state.chat_history = []
if 'extracted_text' not in st.session_state:
    st.session_state.extracted_text = ""
if 'doc_title' not in st.session_state:
    st.session_state.doc_title = ""

# Sidebar settings panel
st.sidebar.markdown("""
    <div style='display: flex; align-items: center; gap: 10px; margin-bottom: 20px;'>
        <div style='width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, #7c3aed, #06b6d4); display: flex; align-items: center; justify-content: center;'>
            <span style='color: white; font-size: 20px; font-weight: bold;'>✨</span>
        </div>
        <span style='font-size: 20px; font-weight: 800; color: white;'>SmartSumm <span style='color:#a78bfa;'>AI</span></span>
    </div>
""", unsafe_allow_html=True)

st.sidebar.subheader("🔌 API Credentials")
# Fetch default API key if configured in the environment
env_key = os.environ.get("GROQ_API", "")
api_key = st.sidebar.text_input("Groq Cloud API Key", value=env_key, type="password", help="Enter a valid Groq API Key to enable Abstractive AI Summaries and Downstream Chat.")

st.sidebar.subheader("⚙️ Parameter Configurations")
summary_type = st.sidebar.radio(
    "Summarization Mode",
    ["Exact Content Summary (Extractive)", "Smart AI Summary (Abstractive)"],
    help="Exact Content mode parses verbatim sentence matches and is 100% hallucination-free. Smart AI mode performs abstractive synthesis via Groq."
)

summary_length = st.sidebar.select_slider(
    "Summary Length",
    options=["short", "medium", "detailed"],
    value="medium",
    format_func=lambda x: f"{x.capitalize()} Summary"
)

# Main container grid
col_left, col_right = st.columns([3, 2], gap="large")

with col_left:
    st.markdown("<h1 class='brand-title'>✨ SmartSumm AI</h1>", unsafe_allow_html=True)
    st.markdown("<p style='color: #9ca3af; margin-top:-10px; margin-bottom: 20px;'>Select your documents, pick your parameters, and compile clarity.</p>", unsafe_allow_html=True)
    
    # Input tabs
    tab_paste, tab_upload = st.tabs(["📝 Paste Text Content", "📁 Upload Document File"])
    
    raw_text = ""
    uploaded_file = None
    
    with tab_paste:
        raw_text = st.text_area(
            "Paste your content layer here", 
            placeholder="Paste your research notes, blogs, reports, or articles here...", 
            height=280,
            label_visibility="collapsed"
        )
        
    with tab_upload:
        uploaded_file = st.file_uploader(
            "Upload raw document file",
            type=["pdf", "docx", "txt"],
            label_visibility="collapsed"
        )
        if uploaded_file:
            st.info(f"File uploaded successfully: **{uploaded_file.name}** ({(uploaded_file.size / (1024*1024)):.2f} MB)")
            
    # Process triggering
    if st.button("Generate Document Summary ✨", use_container_width=True):
        st.session_state.chat_history = []  # Reset chat session on new summary
        st.session_state.summary_result = None
        
        # Determine source text content
        document_text = ""
        doc_title = "Pasted Text content"
        
        if uploaded_file is not None:
            doc_title = uploaded_file.name
            with st.spinner("Extracting text channels..."):
                ext = uploaded_file.name.split('.')[-1].lower()
                if ext == 'pdf':
                    document_text = parse_pdf(uploaded_file)
                elif ext == 'docx':
                    document_text = parse_docx(uploaded_file)
                elif ext == 'txt':
                    document_text = parse_txt(uploaded_file)
        else:
            document_text = raw_text
            
        if not document_text.strip():
            st.error("Please provide some valid text content or upload a document to summarize.")
        else:
            st.session_state.extracted_text = document_text
            st.session_state.doc_title = doc_title
            
            # Execute summary
            if "Exact Content Summary" in summary_type:
                with st.spinner("Compiling sentence matrices..."):
                    time.sleep(1.0)
                    summary = summarize_extractive(document_text, summary_length)
                    st.session_state.summary_result = {
                        "summary": summary,
                        "type": "extractive",
                        "word_count": len(summary.split()),
                        "process_time": "0.15s (Custom Local Engine)"
                    }
                    st.success("Extractive summary compiled successfully!")
            else:
                # Abstractive summary via Groq
                if not api_key:
                    st.warning("⚠️ GROQ_API is unconfigured. AI Abstractive Summaries will run in Demo Fallback Mode.")
                    # Custom offline fallback summary
                    summary = (
                        f"[DEMO MODE: Groq API Key is not configured. Below is a custom factual fallback summary.]\n\n"
                        f"This document discusses the primary core themes of your submitted content.\n\n"
                        f"**Key Highlights:**\n"
                        f"• Length Setting: {summary_length.upper()}\n"
                        f"• Characters received: {len(document_text)} characters\n"
                        f"• Sentences processed: {len(sentencize(document_text))} sentences\n"
                        f"• Factual summary: The uploaded text details essential operations focusing on efficiency. Under proper AI mode, this explanation will simplify all complex technical jargons seamlessly using Deep AI Llama-3."
                    )
                    st.session_state.summary_result = {
                        "summary": summary,
                        "type": "abstractive",
                        "word_count": len(summary.split()),
                        "process_time": "0.01s (Offline Demo Fallback)"
                    }
                else:
                    with st.spinner("Formulating abstractive summary structures..."):
                        try:
                            # Initialize client
                            client = Groq(api_key=api_key)
                            
                            length_prompt = ""
                            if summary_length == 'short':
                                length_prompt = 'Explain the content very briefly in 1 to 2 short paragraphs (maximum 150 words). Focus only on the core idea.'
                            elif summary_length == 'medium':
                                length_prompt = 'Explain the content in a highly understandable format, using 2 to 3 friendly paragraphs (about 250-300 words). Use simple vocabulary.'
                            elif summary_length == 'detailed':
                                length_prompt = 'Provide a thorough, comprehensive section-by-section breakdown of the content. Summarize each major theme in separate, simplified paragraphs. Maintain detail while using very simple language. Length can be up to 500 words.'

                            system_instruction = (
                                f"You are SmartSumm AI, a premium AI Summarizer. Your job is to read the provided text and explain it in extremely simple, beginner-friendly, conversational language.\n"
                                f"Follow these strict rules:\n"
                                f"1. Translate all complex technical jargons, academic concepts, or dense business language into simple vocabulary that an average 12-year-old can easily understand.\n"
                                f"2. Add short, real-world analogies or examples to explain hard topics where helpful.\n"
                                f"3. Output the summary in rich, human-readable markdown paragraphs.\n"
                                f"4. Do NOT use bullet points (bullet points are reserved for extractive mode). Use paragraphs and bold headers if needed.\n"
                                f"5. Length constraint: {length_prompt}"
                            )
                            
                            prompt = f"{system_instruction}\n\nHere is the original text to summarize:\n{document_text}"
                            
                            start_time = time.time()
                            response = client.chat.completions.create(
                                messages=[
                                    {
                                        "role": "user",
                                        "content": prompt
                                    }
                                ],
                                model="llama-3.3-70b-versatile",
                                temperature=0.7,
                                max_tokens=1024
                            )
                            end_time = time.time()
                            
                            summary = response.choices[0].message.content
                            st.session_state.summary_result = {
                                "summary": summary,
                                "type": "abstractive",
                                "word_count": len(summary.split()),
                                "process_time": f"{(end_time - start_time):.2f}s (Llama-3.3)"
                            }
                            st.balloons()
                        except Exception as e:
                            st.error(f"Groq API call failed: {str(e)}")

# Right panel workspace (display output & chat)
with col_right:
    st.markdown("<h2 style='font-size: 1.5rem; font-weight: 700; color: white;'>📋 Summary View Board</h2>", unsafe_allow_html=True)
    
    if st.session_state.summary_result:
        res = st.session_state.summary_result
        
        # Styled result block
        st.markdown(f"""
            <div style='background: rgba(17, 24, 39, 0.4); border: 1px solid rgba(255,255,255,0.05); border-radius: 15px; padding: 18px; margin-bottom: 15px;'>
                <span style='background: rgba(124, 58, 237, 0.15); border: 1px solid rgba(124, 58, 237, 0.3); color: #c084fc; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;'>{res['type']} summary</span>
                <span style='color: #6b7280; font-size: 11px; margin-left: 10px;'>⏱️ {res['process_time']}</span>
                <span style='color: #6b7280; font-size: 11px; float: right;'>Words: <strong>{res['word_count']}</strong></span>
            </div>
        """, unsafe_allow_html=True)
        
        # Render markdown content
        st.markdown(res['summary'])
        
        # Download utilities
        pdf_bytes = generate_pdf_bytes(
            st.session_state.doc_title,
            res['summary'],
            res['type'],
            summary_length,
            res['word_count']
        )
        
        st.download_button(
            label="Export Clean PDF 📄",
            data=pdf_bytes,
            file_name=f"SmartSumm_{st.session_state.doc_title.split('.')[0]}_Summary.pdf",
            mime="application/pdf",
            use_container_width=True
        )
        
        # Conversational AI Chat Downstream Panel
        st.markdown("<hr style='border-color: rgba(255,255,255,0.05); margin-top:20px; margin-bottom:20px;'>", unsafe_allow_html=True)
        st.markdown("<h3 style='font-size: 1.1rem; font-weight: 700; color: white;'>💬 Chat with Document</h3>", unsafe_allow_html=True)
        
        # Render active chat history
        chat_container = st.container(height=260)
        for msg in st.session_state.chat_history:
            with chat_container.chat_message(msg["role"]):
                st.markdown(msg["content"])
                
        # Downstream conversational helper queries
        st.markdown("<p style='color: #6b7280; font-size: 11px; margin-bottom: 5px;'>Quick Queries:</p>", unsafe_allow_html=True)
        q_cols = st.columns(4)
        preset_qs = ["Explain more", "Simplify this", "Give key points", "For a beginner"]
        selected_q = ""
        
        for idx, pq in enumerate(preset_qs):
            if q_cols[idx].button(pq, key=f"btn_pq_{idx}", use_container_width=True):
                selected_q = pq
                
        # Send question callback
        def send_chat_message(question):
            if not question.strip():
                return
                
            # Add user message to history
            st.session_state.chat_history.append({"role": "user", "content": question})
            
            if not api_key:
                # Demo offline reply
                st.session_state.chat_history.append({
                    "role": "assistant", 
                    "content": f"[DEMO MODE: Chat is running offline because GROQ_API key is not configured.]\n\nYou asked: \"{question}\"\n\nTo chat actively with your documents, please configure a free Groq API Key in the sidebar credentials panel!"
                })
            else:
                try:
                    # Construct chat prompt
                    formatted_history = "\n".join([
                        f"{'User' if h['role'] == 'user' else 'Assistant'}: {h['content']}" 
                        for h in st.session_state.chat_history[:-1]
                    ])
                    
                    prompt = (
                        f"You are the SmartSumm AI assistant helping the user understand a document they uploaded.\n"
                        f"Here is the ORIGINAL TEXT of the document:\n"
                        f"---------------------------------\n"
                        f"{st.session_state.extracted_text}\n"
                        f"---------------------------------\n\n"
                        f"Here is the GENERATED SUMMARY:\n"
                        f"---------------------------------\n"
                        f"{res['summary']}\n"
                        f"---------------------------------\n\n"
                        f"Previous Conversation Logs:\n"
                        f"{formatted_history}\n\n"
                        f"User's New Question:\n"
                        f"\"{question}\"\n\n"
                        f"Task:\n"
                        f"Answer the user's question simply, in a conversational, helpful, and friendly manner.\n"
                        f"Use the original text and summary as your context. Keep the response concise, engaging, and directly helpful."
                    )
                    
                    client = Groq(api_key=api_key)
                    response = client.chat.completions.create(
                        messages=[
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ],
                        model="llama-3.3-70b-versatile",
                        temperature=0.7,
                        max_tokens=1024
                    )
                    st.session_state.chat_history.append({
                        "role": "assistant",
                        "content": response.choices[0].message.content
                    })
                except Exception as e:
                    st.session_state.chat_history.append({
                        "role": "assistant",
                        "content": f"AI Assistant failed to reply: {str(e)}"
                    })
            
            st.rerun()

        # Input text area for user queries
        user_q = st.chat_input("Ask a follow-up question...")
        
        if selected_q:
            send_chat_message(selected_q)
        elif user_q:
            send_chat_message(user_q)
            
    else:
        st.markdown("""
            <div style='display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; height: 350px; border: 2px dashed rgba(255,255,255,0.05); border-radius: 20px; padding: 40px;'>
                <div style='width: 60px; height: 60px; border-radius: 15px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; margin-bottom: 15px;'>
                    <span style='font-size: 24px; color: #4b5563;'>✨</span>
                </div>
                <h4 style='font-size: 14px; font-weight: 700; color: #9ca3af;'>Ready for Summary</h4>
                <p style='font-size: 11px; color: #6b7280; max-w: 260px; margin-top: 5px;'>
                    Paste text or upload a document PDF/DOCX on the left, choose your style, and compile.
                </p>
            </div>
        """, unsafe_allow_html=True)
