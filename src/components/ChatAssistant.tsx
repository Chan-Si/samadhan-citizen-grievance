import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, ArrowRight } from 'lucide-react';
import type { ChatMessage, Language } from '../types';
import { getLocalizedCategories } from '../mockData';

interface ChatAssistantProps {
  onRedirectToCategory: (categoryId: string) => void;
  language: Language;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  onRedirectToCategory,
  language
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const localizedCategories = getLocalizedCategories(language);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isOverFooter, setIsOverFooter] = useState(false);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Scroll listener to swap colors when overlapping any brown background container (Point 5)
  useEffect(() => {
    const handleScroll = () => {
      const btn = document.getElementById('floating-help-assistant');
      if (!btn) return;
      
      // Locate the center of the fixed button (bottom 24px, right 24px, size 56px)
      const x = window.innerWidth - 52;
      const y = window.innerHeight - 52;
      
      // Temporarily ignore pointer events on the button to check underlying element
      const originalPointer = btn.style.pointerEvents;
      btn.style.pointerEvents = 'none';
      const elem = document.elementFromPoint(x, y);
      btn.style.pointerEvents = originalPointer;
      
      if (!elem) {
        setIsOverFooter(false);
        return;
      }
      
      let current: HTMLElement | null = elem as HTMLElement;
      let isBrownBg = false;
      
      while (current && current !== document.body) {
        const bg = window.getComputedStyle(current).backgroundColor;
        const style = current.getAttribute('style') || '';
        
        // Brown colors: rgb(95, 62, 43), hex #5f3e2b, card wrappers, or custom primary/bg-card variables
        if (
          bg === 'rgb(95, 62, 43)' || 
          bg === '#5f3e2b' || 
          current.classList.contains('card-wrapper') ||
          style.includes('var(--bg-card)') || 
          style.includes('var(--color-primary)')
        ) {
          isBrownBg = true;
          break;
        }
        current = current.parentElement;
      }
      
      setIsOverFooter(isBrownBg);
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    const interval = setInterval(handleScroll, 400); // regular polling checks for layout movements
    
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      clearInterval(interval);
    };
  }, []);

  // Set localized greeting message
  useEffect(() => {
    setMessages([
      {
        id: 'm1',
        sender: 'assistant',
        text: language === 'hi'
          ? 'नमस्ते! मैं समाधान सहायक हूँ। मैं आपकी समस्या के लिए सही श्रेणी खोजने, ट्रैकिंग को समझने या अन्य प्रश्नों के उत्तर देने में मदद कर सकता हूँ। क्या समस्या है?'
          : 'Namaste! I am the Samadhan Assistant. I can help you find the right category for your problem, explain how tracking works, or answer questions. What is happening?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [language]);



  // Reusable local chatbot matcher logic (Interface boundary ready for future AI integration)
  const getLocalBotResponse = (text: string): { responseText: string, redirectId?: string } => {
    const query = text.toLowerCase().trim();

    // Greetings, hellos, and help query matcher (Request 4)
    if (
      query === 'hello' || query === 'hi' || query === 'hey' || query === 'namaste' || query === 'नमस्ते' || query === 'सुप्रभात' ||
      query.includes('what else') || query.includes('questions can i ask') || query.includes('what can you do') || 
      query.includes('how to use') || query.includes('help') || query.includes('सहायता') || query.includes('मदद') ||
      query.includes('सवाल') || query.includes('पूछ') || query.includes('क्या कर सकते हो')
    ) {
      return {
        responseText: language === 'hi'
          ? 'मैं समाधान सहायक हूँ। आप मुझसे निम्न विषयों पर प्रश्न पूछ सकते हैं या शिकायत दर्ज करने में सहायता प्राप्त कर सकते हैं:\n\n• सड़कों की क्षति और ट्रैफिक सिग्नलों की मरम्मत\n• पेंशन के भुगतान में देरी या रोक\n• पानी की आपूर्ति और अवरुद्ध नाली\n• कूड़ा-कचरा उठाना और स्वच्छता\n• बिजली कटौती और खराब मीटर\n• प्रमाण पत्र (जन्म/जाति) जारी होने में देरी\n\nआप किसी भी प्रश्न का उत्तर जानने के लिए नीचे दिए गए सुझाव चिप्स (FAQ) पर भी क्लिक कर सकते हैं!'
          : 'I am the Samadhan Assistant. You can ask me questions or get help with filing complaints about the following topics:\n\n• Road damage, potholes, and broken traffic signals\n• Old age pension delay or stopped welfare benefits\n• Water contamination, leakage, and clogged drainage\n• Garbage collection and public sanitation problems\n• Power cuts, low voltage, or faulty electricity meters\n• Delayed government certificates and documents\n\nYou can also click on any of the suggestion chips below to see step-by-step guides!'
      };
    }

    // 1. Check roads
    if (query.includes('pothole') || query.includes('road') || query.includes('footpath') || query.includes('divider') || query.includes('signal') || query.includes('street light') || query.includes('सड़क') || query.includes('गड्ढा') || query.includes('फुटपाथ') || query.includes('लाइट')) {
      return {
        responseText: language === 'hi'
          ? 'यह सड़क और सार्वजनिक स्थान से संबंधित समस्या लग रही है। आप सड़क विभाग के अंतर्गत सीधे टूटी सड़कों, अवरुद्ध रास्तों या बंद ट्रैफ़िक लाइट की शिकायत दर्ज कर सकते हैं।'
          : 'This sounds like a Roads & Public Spaces issue. You can file reports about damaged asphalt, blocked pathways, or non-functional traffic lights directly under Roads.',
        redirectId: 'roads'
      };
    }

    // 2. Check pension / benefits
    if (query.includes('pension') || query.includes('benefit') || query.includes('subsidy') || query.includes('scholarship') || query.includes('allowance') || query.includes('पेंशन') || query.includes('लाभ') || query.includes('छात्रवृत्ति')) {
      return {
        responseText: language === 'hi'
          ? 'यह पेंशन और लाभ से संबंधित समस्या लग रही है। आप वृद्धावस्था पेंशन में देरी, रुकी हुई सीधी योजना लाभ (DBT), या छात्रवृत्ति की समस्याओं के बारे में शिकायत दर्ज कर सकते हैं।'
          : 'This sounds like a Pension & Benefits issue. You can submit complaints about delayed old age pensions, stopped direct benefit transfers (DBT), or scholarship issues.',
        redirectId: 'pension'
      };
    }

    // 3. Check waste / sanitation
    if (query.includes('garbage') || query.includes('trash') || query.includes('waste') || query.includes('sanitation') || query.includes('dumping') || query.includes('toilet') || query.includes('sweeper') || query.includes('कचरा') || query.includes('सफाई') || query.includes('शौचालय')) {
      return {
        responseText: language === 'hi'
          ? 'यह कचरा और स्वच्छता विभाग के अंतर्गत आता है। आप न उठाए गए कचरे, ओवरफ़्लो होने वाले सार्वजनिक डस्टबिन, या बंद सार्वजनिक शौचालयों की शिकायत कर सकते हैं।'
          : 'This falls under Waste & Sanitation. You can report uncollected household trash, overflowing public dumpsters, illegal dumpsites, or blocked public toilets.',
        redirectId: 'waste'
      };
    }

    // 4. Check electricity / power
    if (query.includes('electricity') || query.includes('power') || query.includes('outage') || query.includes('voltage') || query.includes('meter') || query.includes('load shedding') || query.includes('blackout') || query.includes('बिजली') || query.includes('पावर') || query.includes('कटौती') || query.includes('मीटर')) {
      return {
        responseText: language === 'hi'
          ? 'यह बिजली विभाग के अंतर्गत आता है। आप बिजली कटौती, कम वोल्टेज की समस्या, खराब मीटर, या बिलिंग त्रुटियों की शिकायत दर्ज कर सकते हैं।'
          : 'This falls under Electricity. Report local power cuts, low voltage issues, faulty meters, or connection billing errors.',
        redirectId: 'electricity'
      };
    }

    // 5. Check water / drainage
    if (query.includes('water') || query.includes('drain') || query.includes('sewage') || query.includes('leak') || query.includes('clog') || query.includes('waterlogging') || query.includes('पानी') || query.includes('नाली') || query.includes('जलभराव') || query.includes('सीवर')) {
      return {
        responseText: language === 'hi'
          ? 'यह जल और जल निकासी विभाग के अंतर्गत आता है। आप गंदे पीने के पानी, पानी की आपूर्ति में देरी, या जलभराव की शिकायत दर्ज कर सकते हैं।'
          : 'This falls under Water & Drainage. Report dirty drinking water, irregular water timings, or clogged streets.',
        redirectId: 'water'
      };
    }

    // 6. Check certificates
    if (query.includes('certificate') || query.includes('birth') || query.includes('caste') || query.includes('marriage') || query.includes('income') || query.includes('licence') || query.includes('passport') || query.includes('प्रमाण') || query.includes('जन्म') || query.includes('जाति') || query.includes('आय') || query.includes('लाइसेंस')) {
      return {
        responseText: language === 'hi'
          ? 'यह प्रमाणपत्र और दस्तावेज़ से संबंधित है। आप जन्म, जाति, आय या विवाह प्रमाणपत्र जारी करने में देरी या त्रुटियों की शिकायत दर्ज कर सकते हैं।'
          : 'This matches Certificates & Documents. Report administrative delays, errors, or rejections on certificates.',
        redirectId: 'certificates'
      };
    }

    // 7. Check bribe / misconduct
    if (query.includes('bribe') || query.includes('corruption') || query.includes('official') || query.includes('misconduct') || query.includes('harass') || query.includes('vigilance') || query.includes('रिश्वत') || query.includes('भ्रष्टाचार') || query.includes('कदाचार') || query.includes('अधिकारी')) {
      return {
        responseText: language === 'hi'
          ? 'यह सार्वजनिक अधिकारियों और कदाचार से संबंधित है। आप रिश्वत की मांग, अनुचित सेवा इनकार, या आधिकारिक उत्पीड़न की रिपोर्ट कर सकते हैं।'
          : 'This falls under Public Officials & Misconduct. Report unethical demands for money, service refusals, or official harassment.',
        redirectId: 'misconduct'
      };
    }

    // FAQs
    if (query === 'how to file a complaint') {
      return {
        responseText: language === 'hi'
          ? 'शिकायत दर्ज करने के चरण:\n\n1. मुख्य पृष्ठ पर अपनी समस्या से संबंधित श्रेणी (जैसे: सड़क, बिजली) चुनें।\n2. समस्या के विशिष्ट उपविषय का चयन करें।\n3. समस्या का वर्णन लिखें।\n4. मानचित्र पर स्थान चिह्नित करें या पता दर्ज करें।\n5. फ़ोटो/वीडियो साक्ष्य संलग्न करें (वैकल्पिक)।\n6. "शिकायत की समीक्षा करें" पर क्लिक करें और सबमिट करें!'
          : 'Steps to file a complaint:\n\n1. Select a category (e.g. Roads, Electricity) on the Home page.\n2. Choose the specific subtopic describing your issue.\n3. Enter details in the description box.\n4. Select the location on the map or enter your address manually.\n5. Attach photo/video evidence (optional).\n6. Click "Review Grievance" and submit your complaint!'
      };
    }
    if (query === 'what happens after submit') {
      return {
        responseText: language === 'hi'
          ? 'सबमिट करने के बाद की प्रक्रिया:\n\n1. शिकायत को एक अद्वितीय GRV-2026 ट्रैकिंग आईडी दी जाती है।\n2. प्रणाली स्वचालित रूप से संबंधित विभाग को शिकायत सौंपती है।\n3. विभाग के अधिकारी स्थल का निरीक्षण करते हैं और काम शुरू करते हैं।\n4. समाधान हो जाने पर अधिकारी "Resolved" स्थिति की रिपोर्ट करते हैं।\n5. आप इसे अंतिम रूप से सत्यापित कर बंद कर सकते हैं!'
          : 'What happens after submission:\n\n1. Your complaint is assigned a unique GRV-2026 tracking ID.\n2. The system automatically routes it to the responsible local department.\n3. Junior Engineers inspect the site and mark status as "In Progress".\n4. Once fixed, PWD/Municipal team reports action taken.\n5. You must verify and confirm the resolution to close the ticket!'
      };
    }
    if (query === 'explain status meanings') {
      return {
        responseText: language === 'hi'
          ? 'शिकायत की स्थितियों का अर्थ:\n\n• प्रगति पर (In Progress): शिकायत संबंधित विभाग को सौंप दी गई है और काम निर्धारित है।\n• स्पष्टीकरण आवश्यक (Needs Attention): विभाग ने आपसे अतिरिक्त साक्ष्य या दस्तावेज़ का अनुरोध किया है।\n• हल हो गया (Resolved): विभाग ने काम पूरा होने की रिपोर्ट दी है। कृपया इसकी पुष्टि करें।'
          : 'Explanation of Complaint Statuses:\n\n• In Progress: Assigned to the department and scheduled for site inspection/patchwork.\n• Needs Attention: The department requires more details (like uploading document copies) from you.\n• Resolved: The work has been reported as completed. Needs citizen verification.'
      };
    }
    if (query === 'how to track complaint') {
      return {
        responseText: language === 'hi'
          ? 'शिकायत ट्रैक करने के चरण:\n\n1. नीचे नेविगेशन बार में "मेरी शिकायतें" (Complaints) टैब पर क्लिक करें।\n2. अपनी दर्ज शिकायतों की सूची देखें।\n3. विस्तृत समयरेखा, संबंधित विभाग और अपेक्षित समाधान तिथि देखने के लिए कार्ड पर क्लिक करें।'
          : 'Steps to track your complaints:\n\n1. Click on the "Complaints" tab in the navigation bar.\n2. Scroll through your list of filed complaints.\n3. Tap on any complaint card to view the interactive milestone timeline, active department, and expected resolution date.'
      };
    }
    if (query === 'how does voice filing work') {
      return {
        responseText: language === 'hi'
          ? 'वॉयस फाइलिंग का उपयोग कैसे करें:\n\n1. शिकायत दर्ज करते समय विवरण बॉक्स के अंदर नीचे दाईं ओर माइक बटन पर टैप करें।\n2. अनुमति मांगे जाने पर माइक्रोफ़ोन की अनुमति दें।\n3. अपनी समस्या के बारे में बोलें - वॉयस डिक्टेशन स्वचालित रूप से आपकी बात को टेक्स्ट में बदल देगा।'
          : 'How to use Voice Filing:\n\n1. Tap the microphone icon at the bottom-right of the detailed description textarea inside the complaint form.\n2. Allow microphone access when prompted.\n3. Speak clearly - your voice will be dictated directly into the text field in real-time.'
      };
    }
    if (query === 'file anonymous') {
      return {
        responseText: language === 'hi'
          ? 'हाँ, आप फ़ॉर्म में "गुमनाम रूप से शिकायत दर्ज करें" विकल्प को चुनकर गुमनाम शिकायत दर्ज कर सकते हैं। हल करने वाले अधिकारियों को आपका नाम और विवरण नहीं दिखेगा।'
          : 'Yes, you can choose to file a complaint anonymously by toggling the "File Anonymously" option in the form. Your name and contact details will not be visible to the resolving officers.'
      };
    }
    if (query === 'responsible authority') {
      return {
        responseText: language === 'hi'
          ? 'समाधान स्वचालित रूप से आपके क्षेत्र के नगर निगम, लोक निर्माण विभाग (PWD), या राज्य विद्युत बोर्ड जैसे संबंधित स्थानीय अधिकारियों को शिकायत भेजता है।'
          : 'SAMADHAN automatically routes complaints to local authorities like the Municipal Corporation, PWD, or State Electricity Board depending on the category and location.'
      };
    }
    if (query === 'resolution duration') {
      return {
        responseText: language === 'hi'
          ? 'स्ट्रीटलाइट और कचरा उठाने जैसी साधारण समस्याओं में 2-3 कार्यदिवस लगते हैं। मुख्य सड़क या पानी के बड़े कार्यों में उनकी गंभीरता के आधार पर 7-15 दिन लग सकते हैं।'
          : 'Simple issues like streetlights and garbage collection take 2-3 working days. Major road or water works may take 7-15 working days depending on the scope.'
      };
    }
    if (query === 'multiple photos') {
      return {
        responseText: language === 'hi'
          ? 'हाँ, आप निरीक्षण टीम की सहायता के लिए साक्ष्य के रूप में 3 फ़ोटो या वीडियो फ़ाइलें अपलोड कर सकते हैं ताकि समस्या का तेजी से समाधान हो सके।'
          : 'Yes, you can upload up to 3 photos or video files as evidence to help the inspection team locate and resolve the issue faster.'
      };
    }
    if (query === 'reopen complaint') {
      return {
        responseText: language === 'hi'
          ? 'यदि विभाग ने समस्या को हल चिह्नित किया है लेकिन समस्या बनी हुई है, तो आप शिकायत विवरण स्क्रीन पर "असंतोषजनक / पुनः खोलें" पर क्लिक करके इसे वापस भेज सकते हैं।'
          : 'If the department marks your issue as resolved but the problem persists, you can click "Unsatisfactory / Reopen" on the complaint details screen to send it back.'
      };
    }
    if (query === 'change location') {
      return {
        responseText: language === 'hi'
          ? '"प्रोफ़ाइल" पृष्ठ पर जाएं, "प्रोफ़ाइल संपादित करें" या "पंजीकृत पता बदलें" पर क्लिक करें और अपना जिला, राज्य और मील का पत्थर अपडेट करें।'
          : 'Go to the "Profile" page, click "Edit Profile" or "Change Registered Address", and update your district, state, and residency landmark.'
      };
    }
    if (query === 'delete account') {
      return {
        responseText: language === 'hi'
          ? 'अपना खाता हटाने और सभी शिकायतों को साफ़ करने के लिए, प्रोफ़ाइल सेटिंग में जाएं, नीचे स्क्रॉल करें और "खाता निष्क्रिय/हटाएं" पर क्लिक करें।'
          : 'To delete your account and clear all stored complaints, navigate to Profile settings, scroll to the bottom, and click "Deactivate/Delete Account".'
      };
    }
    if (query === 'other states') {
      return {
        responseText: language === 'hi'
          ? 'समाधान वर्तमान में स्थानीयकरण सुनिश्चित करने के लिए आपकी प्रोफ़ाइल में पंजीकृत जिले की सीमाओं के भीतर काम करता है। अन्य स्थान के लिए प्रोफ़ाइल अपडेट करें।'
          : 'SAMADHAN currently operates within the district boundaries registered to your profile to ensure localization. To file elsewhere, update your profile location.'
      };
    }
    if (query === 'mobile app') {
      return {
        responseText: language === 'hi'
          ? 'समाधान एक प्रोग्रेसिव वेब ऐप है। आप अपने ब्राउज़र के "होम स्क्रीन पर जोड़ें" विकल्प का उपयोग करके इसे सीधे अपने फोन पर स्थापित कर सकते हैं।'
          : 'SAMADHAN is a progressive web app. You can install it directly to your phone\'s home screen using your browser\'s "Add to Home Screen" option.'
      };
    }
    if (query === 'unsatisfactory resolution') {
      return {
        responseText: language === 'hi'
          ? 'आपके पास समाधान को रेट करने का विकल्प है। यदि आप इसे खराब रेटिंग देते हैं, तो प्रणाली उच्च अधिकारियों द्वारा समीक्षा के लिए इसे चिह्नित कर देगी।'
          : 'You have the option to rate the resolution. If you rate it poorly, the system will flag the ticket for administrative review by higher officials.'
      };
    }
    if (query === 'edit complaint') {
      return {
        responseText: language === 'hi'
          ? 'शिकायतो को विभाग में भेजे जाने के बाद संपादित नहीं किया जा सकता है। हालाँकि, आप उस कार्ड की टिप्पणी समयरेखा में नई जानकारी या फ़ोटो जोड़ सकते हैं।'
          : 'Complaints cannot be edited once submitted to departments. You can, however, post updates or additional comments in the comment timeline of that card.'
      };
    }
    if (query === 'data safety') {
      return {
        responseText: language === 'hi'
          ? 'बिल्कुल। सभी नागरिक डेटा सुरक्षित है और केवल आपकी शिकायत को हल करने के लिए जिम्मेदार सत्यापित सरकारी एजेंसियों के साथ साझा किया जाता है।'
          : 'Absolutely. All citizen data is encrypted locally and only shared securely with verified government agencies responsible for resolving your complaint.'
      };
    }
    if (query === 'contact support') {
      return {
        responseText: language === 'hi'
          ? 'आप हमारे टोल-फ्री हेल्पलाइन नंबर 1800-345-0000 पर कॉल कर सकते हैं या सीधे प्रशासनिक सहायता के लिए support@samadhan.gov.in पर ईमेल कर सकते हैं।'
          : 'You can call our toll-free citizen helpline at 1800-345-0000 or email support@samadhan.gov.in for direct administrative support.'
      };
    }
    if (query === 'priority decided') {
      return {
        responseText: language === 'hi'
          ? 'प्राथमिकता का निर्धारण सुरक्षा जोखिमों (जैसे खुले तार) और उस क्षेत्र के अन्य नागरिकों द्वारा दर्ज समान शिकायतों की संख्या के आधार पर किया जाता है।'
          : 'Priority is calculated based on safety risks (e.g. open wires, sewage leaks) and the number of duplicate/similar reports filed by neighbors in that spot.'
      };
    }
    if (query === 'track public complaints') {
      return {
        responseText: language === 'hi'
          ? 'हाँ! "सार्वजनिक फ़ीड" पृष्ठ आपके जिले में चल रही सभी शिकायतों को मानचित्र पर दिखाता है ताकि आप देख सकें कि आपके क्षेत्र में क्या हो रहा है।'
          : 'Yes! The "Public Feed" page lists all ongoing complaints in your district on a public map so you can see what is happening in your area.'
      };
    }
    if (query === 'find ward number') {
      return {
        responseText: language === 'hi'
          ? 'आप अपने स्थानीय नगर निगम कार्यालय, अपनी संपत्ति कर रसीद, या अपने मतदाता पहचान पत्र के माध्यम से अपना वार्ड नंबर देख सकते हैं।'
          : 'You can check your ward number through your local municipal office directory, property tax receipt, or Voter ID card details.'
      };
    }
    if (query === 'file for others') {
      return {
        responseText: language === 'hi'
          ? 'हाँ! आप अपने पड़ोसियों, बुजुर्गों या इंटरनेट से अपरिचित नागरिकों की मदद करने के लिए अपने खाते से उनके लिए शिकायत दर्ज कर सकते हैं।'
          : 'Yes! You can file complaints on behalf of neighbors, elderly citizens, or anyone who is unfamiliar with digital portals.'
      };
    }
    if (query === 'escalation levels') {
      return {
        responseText: language === 'hi'
          ? 'शिकायत समाधान के 3 स्तर हैं:\n1. कनिष्ठ अभियंता/पर्यवेक्षक\n2. स्थानीय नगर आयुक्त/विभाग प्रमुख\n3. जिला प्रशासन (जिला आयुक्त)'
          : 'SAMADHAN has 3 levels of escalation:\n1. Junior Engineer / Field Inspector\n2. Municipal Commissioner / Dept Head\n3. District Administration (escalated to District Commissioner)'
      };
    }
    if (query === 'who reviews feedback') {
      return {
        responseText: language === 'hi'
          ? 'नागरिकों द्वारा दी गई प्रतिक्रियाओं (Resolved के बाद Rating) की सीधी समीक्षा विभाग प्रमुखों और वरिष्ठ जिला समन्वयकों द्वारा की जाती है।'
          : 'All ratings and disputed reviews are monitored directly by administrative department heads and district coordinators.'
      };
    }
    if (query === 'upload videos') {
      return {
        responseText: language === 'hi'
          ? 'हाँ, आप 15 सेकंड तक के छोटे वीडियो साक्ष्य के रूप में अपलोड कर सकते हैं, ताकि निरीक्षण टीम समस्या की गंभीरता को आसानी से समझ सके।'
          : 'Yes, you can upload video clips (up to 15 seconds long) to help inspectors better understand the severity of the issue.'
      };
    }
    if (query === 'wrong department') {
      return {
        responseText: language === 'hi'
          ? 'यदि विभाग गलत पाया जाता है, तो संबंधित नोडल अधिकारी इसे समाधान प्रणाली द्वारा सही विभाग में पुनः प्रेषित (Re-route) कर देते हैं।'
          : 'If a complaint goes to the wrong department, the receiving officer will decline it and flag it for system re-routing to the correct agency.'
      };
    }
    if (query === 'reopen limit') {
      return {
        responseText: language === 'hi'
          ? 'आप विभाग द्वारा शिकायत को "Resolved" चिह्नित किए जाने के 7 दिनों के भीतर इसे फिर से खोल सकते हैं। इसके बाद शिकायत बंद हो जाती है।'
          : 'You can reopen a complaint within 7 days of it being marked as Resolved. After 7 days, the ticket is permanently closed.'
      };
    }
    if (query === 'file offline') {
      return {
        responseText: language === 'hi'
          ? 'यह एक डिजिटल ऐप है। ऑफलाइन शिकायत दर्ज करने के लिए आप नजदीकी जन सेवा केंद्र (CSC) जा सकते हैं, जहाँ प्रतिनिधि आपकी मदद करेंगे।'
          : 'SAMADHAN is a digital platform. For offline filing, you can visit any Common Service Centre (CSC) where agents will assist you.'
      };
    }
    if (query === 'active departments') {
      return {
        responseText: language === 'hi'
          ? 'सक्रिय विभागों की सूची देखने के लिए मुख्य मेनू में "विभाग सूची" पर जाएं, जहाँ पीडब्ल्यूडी, जल बोर्ड, और बिजली विभाग शामिल हैं।'
          : 'You can view all active local departments (like PWD, Water Board, Electricity Distribution) on the info page in the main navigation.'
      };
    }
    if (query === 'code format') {
      return {
        responseText: language === 'hi'
          ? 'शिकायत कोड का प्रारूप GRV-2026-XXXXX है, जिसमें "GRV" शिकायत (Grievance) को, "2026" वर्ष को, और शेष संख्या विशिष्ट आईडी को दर्शाती है।'
          : 'The tracking code follows the format GRV-2026-XXXXX, where GRV stands for Grievance, 2026 is the year, and XXXXX is the unique serial.'
      };
    }
    if (query === 'notification settings') {
      return {
        responseText: language === 'hi'
          ? 'आप प्रोफाइल पेज पर जाकर "अधिसूचना सेटिंग्स" पर क्लिक करके पुश संदेशों और ईमेल अलर्ट को सक्रिय या निष्क्रिय कर सकते हैं।'
          : 'Navigate to your Profile page, select "Notification Settings", and toggle push alerts or email notifications as per your preference.'
      };
    }
    if (query === 'supported districts') {
      return {
        responseText: language === 'hi'
          ? 'यह वर्तमान में असम के कामरूप मेट्रोपॉलिटन, जोरहाट, डिब्रूगढ़, और कछार जिलों के सभी प्रशासनिक क्षेत्रों में पूरी तरह से सक्रिय है।'
          : 'Currently, the portal is fully operational in Kamrup Metropolitan, Jorhat, Dibrugarh, and Cachar districts of Assam.'
      };
    }
    if (query === 'offline history') {
      return {
        responseText: language === 'hi'
          ? 'हाँ, जब आप इंटरनेट से जुड़े होते हैं तो डेटा सहेज लिया जाता है। इसके बाद आप अपनी शिकायतों की सूची ऑफलाइन भी देख सकते हैं।'
          : 'Yes, once loaded, your submitted complaints list is cached locally so you can view descriptions and IDs even without internet access.'
      };
    }
    if (query === 'duplicate prevention') {
      return {
        responseText: language === 'hi'
          ? 'प्रणाली भौगोलिक स्थान (GPS) का उपयोग करके एक ही जगह की समान शिकायतों को जोड़ देती है ताकि विभाग एक ही बार में समस्या हल कर सके।'
          : 'The platform scans GPS coordinates and clusters duplicate reports in the same spot so the department can address them collectively.'
      };
    }
    if (query === 'fees charge') {
      return {
        responseText: language === 'hi'
          ? 'नहीं! समाधान पोर्टल पर शिकायत दर्ज करने या उसकी प्रगति को ट्रैक करने के लिए नागरिकों से कोई भी शुल्क नहीं लिया जाता है, यह पूरी तरह से मुफ्त है।'
          : 'No! Filing complaints, uploading evidence, and tracking resolutions on the SAMADHAN portal is 100% free of charge.'
      };
    }
    if (query === 'change mobile') {
      return {
        responseText: language === 'hi'
          ? 'सुरक्षा कारणों से, मोबाइल नंबर बदलने के लिए आपको प्रोफाइल सेटिंग्स में ओटीपी (OTP) सत्यापन प्रक्रिया को पूरा करना होगा।'
          : 'For security reasons, changing your registered mobile number requires completing an OTP verification steps under Profile settings.'
      };
    }
    if (query === 'portal slow') {
      return {
        responseText: language === 'hi'
          ? 'यदि पोर्टल धीमा है, तो कृपया अपना इंटरनेट कनेक्शन जांचें या ब्राउज़र कैश साफ करके ऐप को पुनः प्रारंभ (Restart) करें।'
          : 'If the portal is slow, please check your network connection or clear browser cache and refresh the progressive web app.'
      };
    }
    if (query === 'who runs portal') {
      return {
        responseText: language === 'hi'
          ? 'समाधान पोर्टल का संचालन स्थानीय जिला प्रशासन और राज्य के सूचना प्रौद्योगिकी विभाग (IT Department) द्वारा संयुक्त रूप से किया जाता है।'
          : 'The SAMADHAN grievance redressal portal is jointly managed by the state IT Department and local District Administrations.'
      };
    }
    if (query === 'pension eligibility') {
      return {
        responseText: language === 'hi'
          ? 'पेंशन योजनाओं (जैसे वृद्धावस्था, विधवा पेंशन) की पात्रता जांचने के लिए समाज कल्याण विभाग की आधिकारिक दिशानिर्देश फ़ाइल डाउनलोड करें।'
          : 'To check eligibility parameters (like age, income thresholds) for pension schemes, view guidelines in the Pension category section.'
      };
    }
    if (query === 'verify authenticity') {
      return {
        responseText: language === 'hi'
          ? 'आप जारी किए गए प्रमाणपत्र के क्यूआर कोड (QR Code) को स्कैन करके या हमारे आधिकारिक सत्यापन पोर्टल पर संदर्भ संख्या दर्ज करके जांच कर सकते हैं।'
          : 'You can verify certificate authenticity by scanning the issued QR code or entering the reference code on our verification portal.'
      };
    }

    if (query.includes('location') || query.includes('elsewhere') || query.includes('search') || query.includes('स्थान') || query.includes('नक्शा')) {
      return {
        responseText: language === 'hi'
          ? 'हाँ, आप अपने जिले में कहीं भी समस्या की रिपोर्ट कर सकते हैं! फ़ॉर्म भरते समय स्थान टैब पर जाएं और सटीक स्थान का चयन करें।'
          : 'Yes, you can report problems anywhere in your district! When filing the form, go to the Location tab and select "Search" or "Choose on Map" to drag the marker to the exact spot.'
      };
    }

    return {
      responseText: language === 'hi'
        ? 'मैं इसे विशेष रूप से मिलान नहीं कर सका। क्या आप नीचे दिए गए FAQ प्रश्नों में से किसी एक को चुन सकते हैं?'
        : "I couldn't match that specifically. Please select one of the FAQ questions listed below."
    };
  };

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Display formatted text inside bubbles
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: getQuickQuestions().find(q => q.queryText === textToSend)?.label || textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);

    // Simulate typing delay
    setTimeout(() => {
      const { responseText, redirectId } = getLocalBotResponse(textToSend);
      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickActionRedirect: redirectId
      };
      setMessages(prev => [...prev, botMsg]);
    }, 600);
  };

  const getQuickQuestions = (): { label: string, queryText: string }[] => {
    if (language === 'hi') {
      return [
        { label: 'शिकायत कैसे दर्ज करें?', queryText: 'how to file a complaint' },
        { label: 'सबमिट करने के बाद क्या होगा?', queryText: 'what happens after submit' },
        { label: 'शिकायत की स्थिति का क्या अर्थ है?', queryText: 'explain status meanings' },
        { label: 'मैं शिकायत कैसे ट्रैक करूँ?', queryText: 'how to track complaint' },
        { label: 'वॉयस फाइलिंग कैसे काम करती है?', queryText: 'how does voice filing work' },
        { label: 'क्या मैं गुमनाम रूप से शिकायत कर सकता हूँ?', queryText: 'file anonymous' },
        { label: 'जिम्मेदार अधिकारी कौन है?', queryText: 'responsible authority' },
        { label: 'समाधान में कितना समय लगता है?', queryText: 'resolution duration' },
        { label: 'क्या मैं एक से अधिक फोटो अपलोड कर सकता हूँ?', queryText: 'multiple photos' },
        { label: 'क्या मैं बंद शिकायत को फिर से खोल सकता हूँ?', queryText: 'reopen complaint' },
        { label: 'अपने खाते का स्थान कैसे बदलें?', queryText: 'change location' },
        { label: 'मैं अपना खाता कैसे हटाऊं?', queryText: 'delete account' },
        { label: 'क्या मैं अन्य राज्यों की शिकायत कर सकता हूँ?', queryText: 'other states' },
        { label: 'क्या कोई मोबाइल ऐप है?', queryText: 'mobile app' },
        { label: 'यदि समाधान असंतोषजनक हो तो क्या करें?', queryText: 'unsatisfactory resolution' },
        { label: 'क्या मैं सबमिट की गई शिकायत को संपादित कर सकता हूँ?', queryText: 'edit complaint' },
        { label: 'क्या मेरी व्यक्तिगत जानकारी सुरक्षित है?', queryText: 'data safety' },
        { label: 'नागरिक सहायता से कैसे संपर्क करें?', queryText: 'contact support' },
        { label: 'शिकायतो की प्राथमिकता कैसे तय होती है?', queryText: 'priority decided' },
        { label: 'क्या मैं अन्य नागरिकों की शिकायतें देख सकता हूँ?', queryText: 'track public complaints' },
        { label: 'अपना वार्ड नंबर कैसे पता करें?', queryText: 'find ward number' },
        { label: 'क्या मैं किसी अन्य व्यक्ति के लिए शिकायत दर्ज कर सकता हूँ?', queryText: 'file for others' },
        { label: 'शिकायत निवारण के स्तर क्या हैं?', queryText: 'escalation levels' },
        { label: 'समाधान पर प्रतिक्रिया की समीक्षा कौन करता है?', queryText: 'who reviews feedback' },
        { label: 'क्या मैं वीडियो साक्ष्य अपलोड कर सकता हूँ?', queryText: 'upload videos' },
        { label: 'गलत विभाग सौंपे जाने पर क्या करें?', queryText: 'wrong department' },
        { label: 'शिकायत फिर से खोलने की समय सीमा क्या है?', queryText: 'reopen limit' },
        { label: 'क्या मैं ऑफलाइन शिकायत दर्ज कर सकता हूँ?', queryText: 'file offline' },
        { label: 'सक्रिय विभागों की सूची कैसे देखें?', queryText: 'active departments' },
        { label: 'GRV-2026 कोड का प्रारूप क्या है?', queryText: 'code format' },
        { label: 'अधिसूचनाएं कैसे चालू/बंद करें?', queryText: 'notification settings' },
        { label: 'कौन से जिले समर्थित हैं?', queryText: 'supported districts' },
        { label: 'क्या मैं ऑफलाइन भी अपनी शिकायतें देख सकता हूँ?', queryText: 'offline history' },
        { label: 'दोहरी रिपोर्टिंग को कैसे रोका जाता है?', queryText: 'duplicate prevention' },
        { label: 'शिकायत दर्ज करने का कोई शुल्क है?', queryText: 'fees charge' },
        { label: 'क्या मैं अपना पंजीकृत मोबाइल नंबर बदल सकता हूँ?', queryText: 'change mobile' },
        { label: 'यदि पोर्टल धीमा है तो क्या करें?', queryText: 'portal slow' },
        { label: 'समाधान पोर्टल कौन चलाता है?', queryText: 'who runs portal' },
        { label: 'पेंशन योजनाओं की पात्रता कैसे जांचें?', queryText: 'pension eligibility' },
        { label: 'प्रमाणपत्र की प्रामाणिकता कैसे सत्यापित करें?', queryText: 'verify authenticity' }
      ];
    }
    return [
      { label: 'How do I file a complaint?', queryText: 'how to file a complaint' },
      { label: 'What happens after I submit?', queryText: 'what happens after submit' },
      { label: 'What does my complaint status mean?', queryText: 'explain status meanings' },
      { label: 'How do I track my complaints?', queryText: 'how to track complaint' },
      { label: 'How does voice filing work?', queryText: 'how does voice filing work' },
      { label: 'Can I report anonymously?', queryText: 'file anonymous' },
      { label: 'Who is the responsible authority?', queryText: 'responsible authority' },
      { label: 'How long does resolution take?', queryText: 'resolution duration' },
      { label: 'Can I upload multiple photos?', queryText: 'multiple photos' },
      { label: 'Can I reopen a closed complaint?', queryText: 'reopen complaint' },
      { label: 'How to change my account location?', queryText: 'change location' },
      { label: 'How do I delete my account?', queryText: 'delete account' },
      { label: 'Can I report issues in other states?', queryText: 'other states' },
      { label: 'Is there a SAMADHAN mobile app?', queryText: 'mobile app' },
      { label: 'What if the resolution is unsatisfactory?', queryText: 'unsatisfactory resolution' },
      { label: 'Can I edit a submitted complaint?', queryText: 'edit complaint' },
      { label: 'Are my personal details safe?', queryText: 'data safety' },
      { label: 'How to contact citizen support?', queryText: 'contact support' },
      { label: 'How is priority decided for complaints?', queryText: 'priority decided' },
      { label: 'Can I track other citizens\' complaints?', queryText: 'track public complaints' },
      { label: 'How do I find my ward number?', queryText: 'find ward number' },
      { label: 'Can I file a complaint for someone else?', queryText: 'file for others' },
      { label: 'What are the escalation levels?', queryText: 'escalation levels' },
      { label: 'Who reviews resolution feedback?', queryText: 'who reviews feedback' },
      { label: 'Can I upload video evidence?', queryText: 'upload videos' },
      { label: 'What if the wrong department is assigned?', queryText: 'wrong department' },
      { label: 'Is there a time limit to reopen a complaint?', queryText: 'reopen limit' },
      { label: 'Can I file a complaint offline?', queryText: 'file offline' },
      { label: 'How to check the active departments?', queryText: 'active departments' },
      { label: 'What is the GRV-2026 code format?', queryText: 'code format' },
      { label: 'How to enable/disable notifications?', queryText: 'notification settings' },
      { label: 'Which districts are supported?', queryText: 'supported districts' },
      { label: 'Can I view my complaints offline?', queryText: 'offline history' },
      { label: 'How is duplicate reporting prevented?', queryText: 'duplicate prevention' },
      { label: 'Is there any charge/fee to report?', queryText: 'fees charge' },
      { label: 'Can I change my registered mobile number?', queryText: 'change mobile' },
      { label: 'What if the portal is slow or not loading?', queryText: 'portal slow' },
      { label: 'Who runs the SAMADHAN portal?', queryText: 'who runs portal' },
      { label: 'How to check eligibility for pension schemes?', queryText: 'pension eligibility' },
      { label: 'How to verify certificate authenticity?', queryText: 'verify authenticity' }
    ];
  };

  const handleQuickAction = (actionQuery: string) => {
    handleSend(actionQuery);
  };

  const handleCategoryRedirect = (categoryId: string) => {
    setIsOpen(false);
    onRedirectToCategory(categoryId);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        id="floating-help-assistant"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: isOverFooter ? '#FFFFFF' : 'var(--color-primary)',
          color: isOverFooter ? 'var(--color-primary)' : '#FFFFFF',
          border: isOverFooter ? '2px solid var(--color-primary)' : 'none',
          borderRadius: '50%',
          width: '56px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: isOverFooter ? '0 10px 20px rgba(0, 0, 0, 0.25)' : '0 10px 15px -3px rgba(17, 94, 89, 0.3), 0 4px 6px -2px rgba(17, 94, 89, 0.2)',
          zIndex: 999,
          transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        aria-label="Need Help Assistant"
      >
        {isOpen ? <X size={26} /> : <MessageSquare size={26} />}
      </button>

      {/* Assistant chat drawer */}
      {isOpen && (
        <div 
          className="animate-slide-in-right"
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '24px',
            width: '360px',
            maxHeight: '580px',
            height: 'calc(100vh - 120px)',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '2px solid var(--color-primary)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 999
          }}
        >
          {/* Header */}
          <div style={{
            background: 'var(--color-primary)',
            color: '#FFFFFF',
            padding: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{ margin: 0, color: '#FFFFFF', fontSize: '1rem', fontWeight: 700 }}>Samadhan Assistant</h3>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-primary-light)' }}>
                Not sure what to report or do next?
              </span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            padding: '1rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem',
            backgroundColor: '#F8FAFC'
          }}>
            {messages.map(m => (
              <div 
                key={m.id}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%'
                }}
              >
                <div style={{
                  padding: '0.75rem 0.9rem',
                  borderRadius: '12px',
                  borderTopRightRadius: m.sender === 'user' ? '2px' : '12px',
                  borderTopLeftRadius: m.sender === 'assistant' ? '2px' : '12px',
                  backgroundColor: m.sender === 'user' ? 'var(--color-primary)' : '#FFFFFF',
                  color: m.sender === 'user' ? '#FFFFFF' : 'var(--color-text-main)',
                  border: m.sender === 'user' ? 'none' : '1px solid var(--color-border)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  fontSize: '0.8rem',
                  lineHeight: '1.4',
                  whiteSpace: 'pre-line'
                }}>
                  {m.text}

                  {/* Redirection action inside chat */}
                  {m.quickActionRedirect && (
                    <div style={{ marginTop: '0.6rem' }}>
                      <button
                        onClick={() => handleCategoryRedirect(m.quickActionRedirect!)}
                        style={{
                          backgroundColor: 'var(--color-primary-light)',
                          color: 'var(--color-primary)',
                          border: '1px solid var(--color-primary)',
                          borderRadius: '6px',
                          padding: '0.35rem 0.6rem',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.2rem'
                        }}
                      >
                        Open {localizedCategories.find((c: any) => c.id === m.quickActionRedirect)?.title}
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  )}
                </div>
                <span style={{
                  fontSize: '0.65rem',
                  color: 'var(--color-text-muted)',
                  display: 'block',
                  textAlign: m.sender === 'user' ? 'right' : 'left',
                  marginTop: '0.2rem',
                  padding: '0 4px'
                }}>
                  {m.timestamp}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action suggestions - Vertical list instead of free text input */}
          <div style={{
            padding: '0.6rem 0.8rem',
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            flexShrink: 0,
            maxHeight: '145px',
            overflowY: 'auto'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.1rem' }}>
              {language === 'hi' ? 'सामान्य प्रश्न (FAQs):' : 'Frequently Asked Questions:'}
            </div>
            {getQuickQuestions().map(chip => (
              <button
                key={chip.label}
                onClick={() => handleQuickAction(chip.queryText)}
                style={{
                  textAlign: 'left',
                  backgroundColor: '#F1F5F9',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  padding: '0.45rem 0.6rem',
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  color: 'var(--color-text-main)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#E2E8F0';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#F1F5F9';
                }}
              >
                <span>{chip.label}</span>
                <ArrowRight size={12} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.3); opacity: 0; }
        }
      `}</style>
    </>
  );
};
