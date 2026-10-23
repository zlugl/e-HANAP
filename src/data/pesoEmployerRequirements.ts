export interface PesoRequirementDefinition {
  id: string;
  fieldKey: string;
  title: string;
  issuingAgency: string;
  description: string;
  purpose: string;
  applicableEstablishments: string;
  isGeneralRequirement: boolean; // applicable to almost all businesses
  fileTypeHint: string;
}

export const PESO_EMPLOYER_REQUIREMENTS: PesoRequirementDefinition[] = [
  {
    id: 'mayors_permit',
    fieldKey: 'mayorsPermitFile',
    title: "Mayor's Business Permit / BPLO Permit",
    issuingAgency: "Business Permits & Licensing Office (BPLO) / Office of the Municipal Mayor",
    description: "Kasalukuyang Mayor's Permit para sa lehitimong operasyon ng negosyo sa Munisipalidad ng Roxas, Oriental Mindoro.",
    purpose: "Pangunahing rekisito para sa ligal na operasyon at pangangalap ng manggagawa sa munisipyo.",
    applicableEstablishments: "Lahat ng lokal na MSMEs, korporasyon, at visiting companies.",
    isGeneralRequirement: true,
    fileTypeHint: "PDF o malinaw na kopya ng Mayor's Business Permit para sa kasalukuyang taon."
  },
  {
    id: 'dti_sec',
    fieldKey: 'dtiSecFile',
    title: 'DTI Certificate / SEC / CDA Registration Certificate',
    issuingAgency: 'DTI / SEC / CDA',
    description: 'Sertipiko ng Rehistrasyon ng Pangalan ng Negosyo mula sa DTI (Sole Proprietorship), SEC (Corporation/Partnership), o CDA (Cooperative).',
    purpose: 'Pangunahing legal identity at lehitimong pag-iral ng establisyimento sa Pilipinas.',
    applicableEstablishments: 'Lahat ng uri ng establisyimento at negosyo (Mandatory).',
    isGeneralRequirement: true,
    fileTypeHint: 'PDF o JPG ng DTI Business Name Certificate o SEC Certificate of Incorporation.'
  },
  {
    id: 'sanitary_permit',
    fieldKey: 'sanitaryPermitFile',
    title: 'Sanitary Permit / Municipal Health Clearance',
    issuingAgency: 'Rural Health Unit (RHU) / Municipal Health Office (MHO)',
    description: 'Sertipikasyon ng sanitasyon at kalinisan ng pasilidad at health clearance ng establisyimento.',
    purpose: 'Pagtitiyak sa kaligtasan at kalusugan ng mga manggagawa at publiko ayon sa municipal health code.',
    applicableEstablishments: 'Lahat ng komersyal na pasilidad, food/retail, accommodation, at manufacturing.',
    isGeneralRequirement: true,
    fileTypeHint: 'Sanitary Permit to Operate mula sa Municipal Health Office (MHO/RHU).'
  },
  {
    id: 'letter_of_intent',
    fieldKey: 'letterOfIntentFile',
    title: 'Letter of Intent (LOI) to Conduct Local Recruitment / LRA',
    issuingAgency: 'Company Executive / Authorized HR Representative',
    description: 'Opisyal na liham ng kumpanya na nakatuon sa Punong Bayan at PESO Roxas na nagdedeklara ng layuning kumuha ng lokal na manggagawa.',
    purpose: 'Opisyal na koordinasyon sa PESO upang maiwasan ang predatory o illegal recruitment sa Roxas.',
    applicableEstablishments: 'Lahat ng nagpo-post ng bakante at nagsasagawa ng Local Recruitment Activities (LRA).',
    isGeneralRequirement: true,
    fileTypeHint: 'Liham na may pirma ng lehitimong kinatawan ng kumpanya na nakadirekta sa PESO Roxas.'
  },
  {
    id: 'aitr',
    fieldKey: 'aitrFile',
    title: 'Annual Income Tax Return (AITR) / BIR 2303',
    issuingAgency: 'Bureau of Internal Revenue (BIR)',
    description: 'Pinakahuling AITR mula sa BIR na may patunay ng filing o BIR Certificate of Registration (Form 2303).',
    purpose: 'Para sa renewal ng negosyo at patunay ng maayos na pagbabayad ng buwis sa pamahalaan.',
    applicableEstablishments: 'Lahat ng operating / renewal businesses sa Oriental Mindoro.',
    isGeneralRequirement: true,
    fileTypeHint: 'PDF o malinaw na scan ng BIR Form 1701/1702/2303 at payment confirmation receipt.'
  },
  {
    id: 'sedula',
    fieldKey: 'sedulaFile',
    title: 'Community Tax Certificate (Sedula)',
    issuingAgency: 'Municipal / Barangay Treasurer',
    description: 'Kasalukuyang taong Sedula (Corporate o Authorized Representative CTC).',
    purpose: 'Lokal na pagpaparehistro at pagpapatunay ng paninirahan/operasyon sa nasasakupang bayan.',
    applicableEstablishments: 'Lahat ng nagmamay-ari o kumakatawan sa negosyo sa munisipalidad.',
    isGeneralRequirement: true,
    fileTypeHint: 'Malinaw na kopya ng Community Tax Certificate.'
  },
  {
    id: 'brgy_clearance',
    fieldKey: 'barangayClearanceFile',
    title: 'Barangay Business Clearance',
    issuingAgency: 'Sangguniang Barangay (Barangay Hall)',
    description: 'Kasalukuyang Barangay Clearance para sa Operasyon ng Negosyo mula sa barangay kung saan nakatayo ang establisyimento.',
    purpose: 'Patunay na walang reklamo o sagabal sa nasasakupang komunidad.',
    applicableEstablishments: 'Lahat ng physical store, opisina, planta, o pasilidad sa Oriental Mindoro.',
    isGeneralRequirement: true,
    fileTypeHint: 'Opisyal na kopya ng Barangay Business Clearance na may lagda ng Punong Barangay.'
  },

  {
    id: 'environment_cert',
    fieldKey: 'environmentCertFile',
    title: 'Environment and Sanitation Certification',
    issuingAgency: 'Environment and Sanitation Office (ESO) / MENRO',
    description: 'Klaripikasyon at sertipikasyon ukol sa solid waste management at environmental compliance.',
    purpose: 'Pagsunod sa mga ordinansang pangkalikasan sa lalawigan ng Oriental Mindoro.',
    applicableEstablishments: 'Mga pagawaan, commercial centers, resorts, at mga establisyimentong may solid/liquid waste output.',
    isGeneralRequirement: false,
    fileTypeHint: 'MENRO / ESO Certificate of Compliance o Solid Waste Clearance.'
  },
  {
    id: 'zoning_clearance',
    fieldKey: 'zoningClearanceFile',
    title: 'Zoning Compliance Certificate / Locational Clearance',
    issuingAgency: 'Municipal Planning and Development Office (MPDO)',
    description: 'Sertipiko na ang pwesto ng negosyo ay alinsunod sa Comprehensive Land Use Plan (CLUP).',
    purpose: 'Pagsunod sa tamang land-use classification (Commercial, Industrial, o Agricultural).',
    applicableEstablishments: 'Mga bagong establisyimento, permanenteng gusali, o nagpalit ng lokasyon.',
    isGeneralRequirement: false,
    fileTypeHint: 'Locational Clearance mula sa MPDO / Zoning Administrator.'
  },
  {
    id: 'building_permit',
    fieldKey: 'buildingPermitFile',
    title: 'Building Permit / Occupational Permit',
    issuingAgency: 'Municipal Engineering Office (MEO) / Building Official',
    description: 'Permiso sa istruktura o Certificate of Occupancy ng gusaling inookupahan ng kumpanya.',
    purpose: 'Kaligtasang pang-istruktural ng pasilidad para sa mga empleyado.',
    applicableEstablishments: 'Mga establisyimentong may sariling gusali o commercial leased spaces.',
    isGeneralRequirement: false,
    fileTypeHint: 'Certificate of Occupancy o Annual Mechanical/Electrical Inspection Certificate.'
  },
  {
    id: 'tourism_clearance',
    fieldKey: 'tourismClearanceFile',
    title: 'Tourism Clearance',
    issuingAgency: 'Municipal Tourism Office',
    description: 'Akreditasyon o clearance para sa operasyon ng turismo at mabuting pakikitungo sa panauhin.',
    purpose: 'Standard compliance para sa industriya ng turismo at hospitality sa Oriental Mindoro.',
    applicableEstablishments: 'Para sa resort, hotel, restaurant, travel agency, at lodging establishments.',
    isGeneralRequirement: false,
    fileTypeHint: 'Municipal Tourism Accreditation Certificate / Endorsement.'
  },
  {
    id: 'payment_receipt',
    fieldKey: 'paymentReceiptFile',
    title: 'Payment Receipt (Official Receipt ng Bayad)',
    issuingAgency: 'Municipal Treasurer’s Office (MTO)',
    description: 'Opisyal na Resibo (OR) ng binayarang business tax, regulatory fees, at permit charges.',
    purpose: 'Patunay ng bayad sa kaukulang buwis at bayarin sa pamahalaang bayan.',
    applicableEstablishments: 'Lahat ng nagbayad ng Mayor’s Permit at local taxes para sa kasalukuyang taon.',
    isGeneralRequirement: true,
    fileTypeHint: 'Official Receipt (O.R.) mula sa Municipal Treasurer.'
  },
  {
    id: 'fire_safety',
    fieldKey: 'fireSafetyFile',
    title: 'Fire Safety Inspection Clearance (FSIC)',
    issuingAgency: 'Bureau of Fire Protection (BFP)',
    description: 'Sertipiko ng pagsusuri laban sa sunog mula sa lokal na istasyon ng BFP.',
    purpose: 'Seguridad at kaligtasan ng mga empleyado at pasilidad laban sa sakuna o sunog.',
    applicableEstablishments: 'Lahat ng komersyal at industriyal na pasilidad (Mandatory BFP requirement).',
    isGeneralRequirement: true,
    fileTypeHint: 'Fire Safety Inspection Certificate (FSIC) na may kasalukuyang bisa.'
  }
];
