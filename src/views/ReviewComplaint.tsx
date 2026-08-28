import React from 'react';
import { ArrowLeft, CheckSquare, Edit, AlertCircle } from 'lucide-react';
import type { Complaint, Language, UserProfile } from '../types';
import { MediaPreview } from '../components/MediaPreview';

interface ReviewComplaintProps {
  formData: Partial<Complaint>;
  user: UserProfile | null;
  onEdit: () => void;
  onSubmit: (overrideData?: Partial<Complaint>) => void;
  language: Language;
}

const getAccountabilityInfo = (category: string = '', subtopic: string = '', district: string = '') => {
  const catLower = category.toLowerCase();
  const subLower = subtopic.toLowerCase();
  const distLabel = district || 'Kamrup Metropolitan';

  let department = '';
  let level: 'District' | 'State' | 'National' = 'District';
  let details = '';

  if (catLower.includes('electricity') || catLower.includes('power') || catLower.includes('बिजली')) {
    department = `Assam Power Distribution Company Limited (APDCL), ${distLabel} Electrical Division`;
    level = 'State';
    details = 'Responsible for state power grid lines, local transmission transformer maintenance, billing errors, and metering infrastructure.';
  } else if (catLower.includes('water') || catLower.includes('drain') || catLower.includes('पानी') || catLower.includes('नाला')) {
    department = `Public Health Engineering Department (PHED) / Municipal Board Water Cell, ${distLabel}`;
    level = 'District';
    details = 'Responsible for municipal safe drinking water pipelines, roadside drain cleaning, underground sewers, and flood waterlogging management.';
  } else if (catLower.includes('waste') || catLower.includes('sanitat') || catLower.includes('कचरा') || catLower.includes('सफाई')) {
    department = `Municipal Conservancy & Swachh Bharat Cell, ${distLabel}`;
    level = 'District';
    details = 'Responsible for door-to-door domestic waste collection, public dustbin clearance, community sweepers deployment, and landfill management.';
  } else if (catLower.includes('road') || catLower.includes('pothole') || catLower.includes('सड़क')) {
    if (subLower.includes('pothole') || subLower.includes('other') || subLower.includes('गड्ढे')) {
      department = `PWD (Roads) Division, ${distLabel}, Government of Assam`;
      level = 'State';
      details = 'Responsible for state highways development, main district road networks, asphalt laying, and structural repairs.';
    } else {
      department = `${distLabel} Municipal Board / City Engineering Division`;
      level = 'District';
      details = 'Responsible for interior municipal colony streets, pedestrian footpaths, local divider repairs, traffic signs, and community speedbreakers.';
    }
  } else if (catLower.includes('transport') || catLower.includes('बस') || catLower.includes('परिवहन')) {
    if (subLower.includes('railway') || subLower.includes('train') || subLower.includes('रेल')) {
      department = 'North East Frontier Railway (NFR) Division, Ministry of Railways';
      level = 'National';
      details = 'Responsible for national railway stations amenities, train arrivals, track operations, and ticketing platforms.';
    } else {
      department = `Assam State Transport Corporation (ASTC), ${distLabel} Regional Office`;
      level = 'State';
      details = 'Responsible for regional bus terminal management, ASTC fleet routing, public shuttle frequency, and state public transport operations.';
    }
  } else if (catLower.includes('pension') || catLower.includes('benefit') || catLower.includes('पेनशन')) {
    department = `Office of the District Social Welfare Officer, ${distLabel} (Govt. of Assam)`;
    level = 'State';
    details = 'Responsible for processing state-sponsored social security benefits, old age pension eligibility checks, and treasury payout approvals.';
  } else if (catLower.includes('certificat') || catLower.includes('document') || catLower.includes('प्रमाणपत्र')) {
    department = `Office of the Deputy Commissioner & District Magistrate, ${distLabel}`;
    level = 'District';
    details = 'Responsible for issuing verified land records, caste certificates, income certificates, and monitoring district e-governance service centers (Seva Kendras).';
  } else if (catLower.includes('education') || catLower.includes('school') || catLower.includes('शिक्षा') || catLower.includes('स्कूल')) {
    department = `Office of the Inspector of Schools, ${distLabel} District Education Block`;
    level = 'District';
    details = 'Responsible for overseeing public primary & secondary school facilities, teachers duty allocations, and board examination logs.';
  } else if (catLower.includes('health') || catLower.includes('hospital') || catLower.includes('स्वास्थ्य') || catLower.includes('अस्पताल')) {
    department = `Joint Director of Health Services, ${distLabel} District, Government of Assam`;
    level = 'State';
    details = 'Responsible for regulating regional public health centers (PHCs), civil hospitals equipment, essential medicine stocks, and medical staff rosters.';
  } else if (catLower.includes('misconduct') || catLower.includes('bribe') || catLower.includes('भ्रष्टाचार') || catLower.includes('अधिकारी')) {
    department = `Directorate of Vigilance & Anti-Corruption, Government of Assam`;
    level = 'State';
    details = 'Responsible for enforcing integrity guidelines, anti-corruption crackdowns, investigating bribe complaints, and auditing state service deliveries.';
  } else {
    department = `District Administration Headquarters, ${distLabel}`;
    level = 'District';
    details = 'Responsible for coordinating local block administrations, civil logistics, and routing public grievances.';
  }

  return { department, level, details };
};

const formatGrievanceDescription = (desc: string = '', formData: Partial<Complaint>, isHi: boolean) => {
  const cleanDesc = desc.trim();
  
  // Heuristic extraction
  let duration = '';
  let impact = '';
  let specificLocation = '';

  // Look for duration indicators
  const durationMatch = cleanDesc.match(/(?:since|for|from)\s+(\d+\s+(?:days?|weeks?|months?|years?|घंटे|दिन|महीने))/i);
  if (durationMatch) {
    duration = durationMatch[1];
  } else if (cleanDesc.toLowerCase().includes('month') || cleanDesc.toLowerCase().includes('महीने')) {
    duration = isHi ? 'एक या अधिक महीने' : 'One or more months';
  } else if (cleanDesc.toLowerCase().includes('week') || cleanDesc.toLowerCase().includes('सप्ताह')) {
    duration = isHi ? 'एक या अधिक सप्ताह' : 'One or more weeks';
  } else if (cleanDesc.toLowerCase().includes('day') || cleanDesc.toLowerCase().includes('दिन')) {
    duration = isHi ? 'एक या अधिक दिन' : 'One or more days';
  } else {
    duration = isHi ? 'जांच लंबित' : 'Under Investigation';
  }

  // Look for local landmark indicators
  if (cleanDesc.toLowerCase().includes('near') || cleanDesc.toLowerCase().includes('opposite') || cleanDesc.toLowerCase().includes('के पास') || cleanDesc.toLowerCase().includes('के सामने')) {
    const nearMatch = cleanDesc.match(/(?:near|opposite|के पास|के सामने)\s+([A-Za-z0-9\s,]+)/i);
    if (nearMatch && nearMatch[1] && nearMatch[1].trim().length > 3) {
      specificLocation = nearMatch[1].trim();
    }
  }

  // Look for severity/impact indicators
  if (formData.severity === 'Serious / Safety risk') {
    impact = isHi ? 'उच्च (सुरक्षा जोखिम और सार्वजनिक असुविधा)' : 'High (Public Safety & Traffic Risk)';
  } else if (formData.severity === 'Moderate') {
    impact = isHi ? 'मध्यम (दैनिक गतिविधियों में बाधा)' : 'Moderate (Obstruction to Daily Activities)';
  } else {
    impact = isHi ? 'सामान्य असुविधा' : 'General Public Inconvenience';
  }

  // Build the structured statement block
  const lines: string[] = [];
  
  lines.push(isHi ? '--- शिकायत का व्यवस्थित सारांश ---' : '--- STRUCTURED GRIEVANCE ANALYSIS ---');
  
  lines.push(`${isHi ? '• मुख्य श्रेणी' : '• Primary Category'}: ${formData.category} (${formData.subcategory})`);
  lines.push(`${isHi ? '• अवधि / प्रभाव काल' : '• Estimated Duration'}: ${duration}`);
  lines.push(`${isHi ? '• प्रभाव का स्तर' : '• Public Impact Level'}: ${impact}`);
  
  if (specificLocation) {
    lines.push(`${isHi ? '• विशिष्ट स्थल' : '• Specific Landmark'}: Near ${specificLocation}`);
  }
  
  if (formData.consumerNumber) {
    lines.push(`${isHi ? '• उपभोक्ता/खाता संख्या' : '• Consumer Account ID'}: ${formData.consumerNumber}`);
  }
  if (formData.referenceNumber) {
    lines.push(`${isHi ? '• संदर्भ/आवेदन संख्या' : '• Reference Card No'}: ${formData.referenceNumber}`);
  }

  lines.push('');
  lines.push(isHi ? '• नागरिक का मूल वक्तव्य:' : '• Citizen\'s Original Statement:');
  lines.push(`  "${cleanDesc || 'No detailed statement provided'}"`);
  
  return lines.join('\n');
};

export const ReviewComplaint: React.FC<ReviewComplaintProps> = ({
  formData,
  user,
  onEdit,
  onSubmit,
  language
}) => {
  const citizenDistrict = user?.district || formData.location?.district || 'Kamrup Metropolitan';
  const { department, level, details } = getAccountabilityInfo(
    formData.category,
    formData.subcategory,
    citizenDistrict
  );

  const isHi = language === 'hi';
  const dateLabel = isHi ? 'दिनांक' : 'Date';
  const refLabel = isHi ? 'शिकायत संख्या' : 'Grievance No';
  const pendingVal = isHi ? 'पंजीकरण लंबित' : 'PENDING SUBMISSION';
  const fromLabel = isHi ? 'प्रेषक (नागरिक विवरण):' : 'FROM (CITIZEN DETAILS):';
  const toLabel = isHi ? 'सेवा में (सक्षम अधिकारी):' : 'TO (COMPETENT AUTHORITY):';
  const competentOfficer = isHi 
    ? 'सक्षम अधिकारी / विभाग प्रमुख,' 
    : 'The Competent Officer / Head of Department,';
  const govOfAssam = isHi ? 'असम सरकार' : 'Government of Assam';
  const subjectLabel = isHi ? 'विषय' : 'SUBJECT';
  
  const salutation = isHi ? 'आदरणीय महोदय / महोदया,' : 'Respected Sir / Madam,';
  const letterBodyOpening = isHi
    ? `मैं एतद्वारा अपने क्षेत्र में '${formData.subcategory}' के संबंध में एक गंभीर सार्वजनिक शिकायत दर्ज करने के लिए लिख रहा हूँ। इस शिकायत के सत्यापित विवरण नीचे प्रस्तुत हैं:`
    : `I am writing to formally bring to your immediate attention a public grievance concerning '${formData.subcategory}' in our locality. The verified details of this matter are presented below:`;
  
  const locTitle = isHi ? '१. घटना / समस्या का स्थान:' : '1. LOCATION OF PROBLEM:';
  const detailsTitle = isHi ? '२. शिकायत का विवरण:' : '2. COMPLAINT DETAILS:';
  const statementTitle = isHi ? '३. नागरिक का विस्तृत विवरण:' : '3. DETAILED STATEMENT OF GRIEVANCE:';
  const accountabilityTitle = isHi ? '४. उत्तरदायी विभाग और अधिकार क्षेत्र:' : '4. ACCOUNTABLE AUTHORITY & JURISDICTION:';
  
  const agencyLabel = isHi ? 'उत्तरदायी एजेंसी' : 'Accountable Agency';
  const levelLabel = isHi ? 'अधिकार क्षेत्र का स्तर' : 'Jurisdiction Scope';
  const dutyLabel = isHi ? 'कर्तव्य का विवरण' : 'Description of Duty';
  
  const closingText = isHi
    ? 'मेरा आपसे विनम्र निवेदन है कि कृपया इस पर तत्काल कार्रवाई करें और समस्या का शीघ्र समाधान सुनिश्चित करें।'
    : 'I request you to kindly deploy a field inspection team and resolve this issue at the earliest to prevent further public inconvenience.';
  
  const yoursFaithfully = isHi ? 'भवदीय / भवदीया,' : 'Yours faithfully,';
  const formattedDate = new Date().toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });

  const handleFinalAction = () => {
    onSubmit({
      responsibleDepartment: department
    });
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '650px', margin: '0 auto', paddingBottom: '2rem' }}>
      
      {/* Back navigation */}
      <div>
        <button
          onClick={onEdit}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-primary)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: 0
          }}
        >
          <ArrowLeft size={16} />
          {isHi ? 'विवरण संपादित करने के लिए वापस जाएं' : 'Go Back and Edit'}
        </button>
      </div>

      {/* Header */}
      <div>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {isHi ? 'अंतिम सत्यापन' : 'Final Validation'}
        </span>
        <h2 style={{ fontSize: '1.6rem', color: 'var(--color-primary)', marginTop: '0.2rem', marginBottom: '0.4rem' }}>
          {isHi ? 'शिकायत पत्र की समीक्षा करें' : 'Verify grievance petition'}
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0 }}>
          {isHi 
            ? 'आपके विवरण को एक आधिकारिक शिकायत पत्र के रूप में प्रारूपित किया गया है। कृपया सबमिट करने से पहले इसकी समीक्षा करें।' 
            : 'Your entered details have been formatted into a petition. Please review the letter before submission.'
          }
        </p>
      </div>

      {/* Official Letterhead Representation - Clean Monochrome Print Style */}
      <div 
        className="monochrome-letter"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1.5px solid var(--color-border)',
          borderRadius: '8px',
          padding: '2rem',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
          color: 'var(--color-text-main)',
          lineHeight: 1.5
        }}
      >

        {/* Letterhead Header */}
        <div style={{ textAlign: 'center', borderBottom: '1.5px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.05em' }}>
            SAMADHAN PUBLIC GRIEVANCE CELL
          </h3>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginTop: '0.2rem' }}>
            Government of Assam • Citizen Empowerment Portal
          </span>
        </div>

        {/* Date & Ref Block */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '1.2rem', borderBottom: '1px dashed var(--color-border)', paddingBottom: '0.6rem' }}>
          <div>
            <strong>{dateLabel}:</strong> {formattedDate}
          </div>
          <div>
            <strong>{refLabel}:</strong> <strong>{pendingVal}</strong>
          </div>
        </div>

        {/* Sender Address */}
        <div style={{ fontSize: '0.85rem', marginBottom: '1.2rem' }}>
          <strong style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.2rem' }}>
            {fromLabel}
          </strong>
          <div style={{ paddingLeft: '0.5rem' }}>
            <div><strong>{user?.name}</strong></div>
            <div>{isHi ? 'मोबाइल' : 'Mobile'}: {user?.mobile}</div>
            {user?.email && <div>{isHi ? 'ईमेल' : 'Email'}: {user.email}</div>}
            <div>{user?.residence || (isHi ? 'वार्ड / निवास विवरण' : 'Ward Residence Details')}, {user?.landmark ? `${user.landmark}, ` : ''} {citizenDistrict}, Assam - {user?.pincode}</div>
          </div>
        </div>

        {/* Recipient Address */}
        <div style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          <strong style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.2rem' }}>
            {toLabel}
          </strong>
          <div style={{ paddingLeft: '0.5rem' }}>
            <div>{competentOfficer}</div>
            <div><strong>{department}</strong></div>
            <div>{citizenDistrict} Division, {govOfAssam}</div>
          </div>
        </div>

        {/* Subject Line */}
        <div style={{ marginBottom: '1.5rem', padding: '0.5rem 0' }}>
          <strong style={{ fontSize: '0.85rem', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>
            {subjectLabel}:
          </strong>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.3 }}>
            {isHi ? 'गंभीर सार्वजनिक समस्या के संबंध में शिकायत' : 'Complaint regarding public grievance'}: {formData.subcategory} ({formData.category}) [Jurisdiction: {level} Government Level Authority]
          </div>
        </div>

        {/* Letter Body */}
        <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', textAlign: 'justify' }}>
          <div>{salutation}</div>
          
          <div>{letterBodyOpening}</div>

          {/* Section 1: Location */}
          <div>
            <strong style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.2rem', textTransform: 'uppercase' }}>
              {locTitle}
            </strong>
            <div style={{ paddingLeft: '0.5rem' }}>
              {formData.location?.address}
            </div>
          </div>

          {/* Section 2: Complaint details / inputs */}
          <div>
            <strong style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              {detailsTitle}
            </strong>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '0.6rem 1.2rem',
              padding: '0.6rem 0.5rem'
            }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block' }}>{isHi ? 'रिपोर्ट की गई समस्या' : 'REPORTED PROBLEM'}</span>
                <strong>{formData.subcategory}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block' }}>{isHi ? 'गंभीरता स्तर' : 'SEVERITY'}</span>
                <strong>{formData.severity}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block' }}>{isHi ? 'प्रथम दृश्य तिथि' : 'FIRST OBSERVED'}</span>
                <strong>{formData.dateObserved && new Date(formData.dateObserved).toLocaleDateString([], { dateStyle: 'medium' })}</strong>
              </div>
              
              {/* Category-specific extra entries */}
              {formData.consumerNumber && (
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block' }}>{isHi ? 'उपभोक्ता संख्या' : 'CONSUMER ID'}</span>
                  <strong>{formData.consumerNumber}</strong>
                </div>
              )}
              {formData.serviceType && (
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block' }}>{isHi ? 'सेवा का प्रकार' : 'SERVICE TYPE'}</span>
                  <strong>{formData.serviceType}</strong>
                </div>
              )}
              {formData.documentType && (
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block' }}>{isHi ? 'दस्तावेज़' : 'DOCUMENT'}</span>
                  <strong>{formData.documentType}</strong>
                </div>
              )}
              {formData.referenceNumber && (
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block' }}>{isHi ? 'आवेदन / कार्ड संख्या' : 'REFERENCE/CARD NO'}</span>
                  <strong>{formData.referenceNumber}</strong>
                </div>
              )}
              {formData.institutionName && (
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block' }}>{isHi ? 'संस्थान का नाम' : 'INSTITUTION'}</span>
                  <strong>{formData.institutionName}</strong>
                </div>
              )}
              {formData.misconductType && (
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block' }}>{isHi ? 'कदाचार का प्रकार' : 'MISCONDUCT TYPE'}</span>
                  <strong>{formData.misconductType}</strong>
                </div>
              )}
              {formData.officeInvolved && (
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block' }}>{isHi ? 'कार्यालय शामिल' : 'OFFICE INVOLVED'}</span>
                  <strong>{formData.officeInvolved}</strong>
                </div>
              )}
              
              {/* Prior grievance history details if present */}
              {formData.priorGrievanceId && (
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block' }}>{isHi ? 'पूर्व शिकायत इतिहास' : 'PRIOR COMPLAINT REFERENCE'}</span>
                  <strong>Grievance #{formData.priorGrievanceId} {formData.priorGrievanceDate ? `(Submitted: ${new Date(formData.priorGrievanceDate).toLocaleDateString()})` : ''}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Detailed report */}
          <div>
            <strong style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.2rem', textTransform: 'uppercase' }}>
              {statementTitle}
            </strong>
            <p style={{ 
              fontSize: '0.85rem', 
              lineHeight: '1.45', 
              padding: '0.8rem 0.5rem', 
              margin: 0,
              whiteSpace: 'pre-wrap'
            }}>
              {formatGrievanceDescription(formData.description || '', formData, isHi)}
            </p>
          </div>

          {/* Section 4: Accountable Agency Block */}
          <div>
            <strong style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.2rem', textTransform: 'uppercase' }}>
              {accountabilityTitle}
            </strong>
            <div style={{ 
              padding: '0.6rem 0.5rem',
              fontSize: '0.85rem'
            }}>
              <div style={{ marginBottom: '0.3rem' }}>
                <strong>{agencyLabel}:</strong> {department}
              </div>
              <div style={{ marginBottom: '0.3rem' }}>
                <strong>{levelLabel}:</strong> <strong>{level} Government Level Authority Fault</strong>
              </div>
              <div>
                <strong>{dutyLabel}:</strong> {details}
              </div>
            </div>
          </div>

          {/* Evidence Preview List */}
          {formData.evidence && formData.evidence.length > 0 && (
            <div>
              <strong style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                {isHi ? 'संलग्न साक्ष्य (' + formData.evidence.length + ' फाइलें):' : 'ATTACHED EVIDENCE (' + formData.evidence.length + ' files):'}
              </strong>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {formData.evidence.map((src, index) => (
                  <div key={index} style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#1E293B'
                  }}>
                    <MediaPreview src={src} alt={`Evidence preview ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Closing request */}
          <div>{closingText}</div>

          {/* Signature Block */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
            <div>
              <div>{yoursFaithfully}</div>
              <div style={{ marginTop: '2rem', fontWeight: 800 }}>{user?.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{isHi ? 'सत्यापित नागरिक' : 'Verified Citizen'}</div>
            </div>
          </div>

        </div>
      </div>

      {/* Info Alert Banner */}
      <div style={{
        display: 'flex',
        gap: '0.6rem',
        backgroundColor: 'var(--color-primary-light)',
        border: '1.5px dashed var(--color-primary)',
        borderRadius: '12px',
        padding: '0.8rem 1rem',
        color: 'var(--color-primary)',
        fontSize: '0.8rem',
        fontWeight: 700
      }}>
        <AlertCircle size={18} style={{ flexShrink: 0 }} />
        <span>
          {isHi 
            ? 'सबमिट पर क्लिक करने से यह शिकायत उपरोक्त विभाग के पास दर्ज हो जाएगी।' 
            : 'Submitting this will register the petition in the Assam State Grievance Cell database.'
          }
        </span>
      </div>

      {/* Action Buttons Below the Letter */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginTop: '0.5rem' 
      }}>
        <button
          type="button"
          className="btn-secondary"
          onClick={onEdit}
          style={{ flex: 1, borderRadius: '12px', padding: '0.8rem 1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <Edit size={16} />
          {isHi ? 'विवरण बदलें' : 'Edit details'}
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={handleFinalAction}
          style={{ flex: 2, borderRadius: '12px', padding: '0.8rem 1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <CheckSquare size={16} />
          {isHi ? 'शिकायत सबमिट करें' : 'Submit Complaint'}
        </button>
      </div>

      <style>{`
        .monochrome-letter,
        .monochrome-letter strong,
        .monochrome-letter h3,
        .monochrome-letter b,
        .monochrome-letter div,
        .monochrome-letter span {
          font-weight: normal !important;
        }
      `}</style>
    </div>
  );
};
