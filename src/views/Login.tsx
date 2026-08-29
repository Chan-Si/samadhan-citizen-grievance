import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, Globe, Lock, ShieldAlert, Sparkles, Eye, EyeOff } from 'lucide-react';
import type { UserProfile, Language } from '../types';
import { Parallelogram } from '../components/Parallelogram';
import { CustomSelect } from '../components/CustomSelect';

interface LoginProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  onLoginSuccess: (profile: UserProfile) => void;
}

import { STATES_AND_DISTRICTS } from '../statesAndDistricts';
import { authService } from '../services';

const LOCALIZED_STATES: Record<Language, Record<string, string>> = {
  en: {
    'Andhra Pradesh': 'Andhra Pradesh', 'Arunachal Pradesh': 'Arunachal Pradesh', 'Assam': 'Assam',
    'Bihar': 'Bihar', 'Chhattisgarh': 'Chhattisgarh', 'Goa': 'Goa', 'Gujarat': 'Gujarat',
    'Haryana': 'Haryana', 'Himachal Pradesh': 'Himachal Pradesh', 'Jharkhand': 'Jharkhand',
    'Karnataka': 'Karnataka', 'Kerala': 'Kerala', 'Madhya Pradesh': 'Madhya Pradesh',
    'Maharashtra': 'Maharashtra', 'Manipur': 'Manipur', 'Meghalaya': 'Meghalaya',
    'Mizoram': 'Mizoram', 'Nagaland': 'Nagaland', 'Odisha': 'Odisha', 'Punjab': 'Punjab',
    'Rajasthan': 'Rajasthan', 'Sikkim': 'Sikkim', 'Tamil Nadu': 'Tamil Nadu', 'Telangana': 'Telangana',
    'Tripura': 'Tripura', 'Uttarakhand': 'Uttarakhand', 'Uttar Pradesh': 'Uttar Pradesh',
    'West Bengal': 'West Bengal', 'Andaman and Nicobar Islands': 'Andaman and Nicobar Islands',
    'Chandigarh': 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu': 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi': 'Delhi', 'Jammu and Kashmir': 'Jammu and Kashmir', 'Ladakh': 'Ladakh',
    'Lakshadweep': 'Lakshadweep', 'Puducherry': 'Puducherry'
  },
  hi: {
    'Andhra Pradesh': 'आंध्र प्रदेश', 'Arunachal Pradesh': 'अरुणाचल प्रदेश', 'Assam': 'असम',
    'Bihar': 'बिहार', 'Chhattisgarh': 'छत्तीसगढ़', 'Goa': 'गोवा', 'Gujarat': 'गुजरात',
    'Haryana': 'हरियाणा', 'Himachal Pradesh': 'हिमाचल प्रदेश', 'Jharkhand': 'झारखंड',
    'Karnataka': 'कर्नाटक', 'Kerala': 'केरल', 'Madhya Pradesh': 'मध्य प्रदेश',
    'Maharashtra': 'महाराष्ट्र', 'Manipur': 'मणिपुर', 'Meghalaya': 'मेघालय',
    'Mizoram': 'मिजोरम', 'Nagaland': 'नागालैंड', 'Odisha': 'ओडिशा', 'Punjab': 'पंजाब',
    'Rajasthan': 'राजस्थान', 'Sikkim': 'सिक्किम', 'Tamil Nadu': 'तमिलनाडु', 'Telangana': 'तेलंगाना',
    'Tripura': 'त्रिपुरा', 'Uttarakhand': 'उत्तराखंड', 'Uttar Pradesh': 'उत्तर प्रदेश',
    'West Bengal': 'पश्चिम बंगाल', 'Andaman and Nicobar Islands': 'अंडमान और निकोबार द्वीप समूह',
    'Chandigarh': 'चंडीगढ़', 'Dadra and Nagar Haveli and Daman and Diu': 'दादरा और नगर हवेली और दमन और दीव',
    'Delhi': 'दिल्ली', 'Jammu and Kashmir': 'जम्मू और कश्मीर', 'Ladakh': 'लद्दाख',
    'Lakshadweep': 'लक्षद्वीप', 'Puducherry': 'पुडुचेरी'
  },
  as: {
    'Andhra Pradesh': 'অন্ধ্ৰ প্ৰদেশ', 'Arunachal Pradesh': 'অৰুণাচল প্ৰদেশ', 'Assam': 'অসম',
    'Bihar': 'বিহাৰ', 'Chhattisgarh': 'ছত্তীশগড়', 'Goa': 'গোৱা', 'Gujarat': 'গুজৰাট',
    'Haryana': 'হাৰিয়ানা', 'Himachal Pradesh': 'হিমাচল প্ৰদেশ', 'Jharkhand': 'ঝাৰখণ্ড',
    'Karnataka': 'কৰ্ণাটক', 'Kerala': 'কেৰালা', 'Madhya Pradesh': 'মধ্য প্ৰদেশ',
    'Maharashtra': 'মহাৰাষ্ট্ৰ', 'Manipur': 'মণিপুৰ', 'Meghalaya': 'মেঘালয়',
    'Mizoram': 'মিজোৰাম', 'Nagaland': 'নাগালেণ্ড', 'Odisha': 'ওড়িশা', 'Punjab': 'পঞ্জাৱ',
    'Rajasthan': 'ৰাজস্থান', 'Sikkim': 'চিকিম', 'Tamil Nadu': 'তামিলনাডু', 'Telangana': 'তেলেংগানা',
    'Tripura': 'ত্ৰিপুৰা', 'Uttarakhand': 'উত্তৰাখণ্ড', 'Uttar Pradesh': 'উত্তৰ প্ৰদেশ',
    'West Bengal': 'পশ্চিম বংগ', 'Andaman and Nicobar Islands': 'আন্দামান আৰু নিকোবৰ দ্বীপপুঞ্জ',
    'Chandigarh': 'চণ্ডীগড়', 'Dadra and Nagar Haveli and Daman and Diu': 'দাদৰা আৰু নগৰ হাভেলী আৰু দমন আৰু দিউ',
    'Delhi': 'দিল্লী', 'Jammu and Kashmir': 'জম্মু আৰু কাশ্মীৰ', 'Ladakh': 'লাডাখ',
    'Lakshadweep': 'লাক্ষাদ্বীপ', 'Puducherry': 'পুডুচেৰী'
  },
  bn: {
    'Andhra Pradesh': 'অন্ধ্রপ্রদেশ', 'Arunachal Pradesh': 'অরুণাচল প্রদেশ', 'Assam': 'অসম',
    'Bihar': 'বিহার', 'Chhattisgarh': 'ছত্তিশগড়', 'Goa': 'গোয়া', 'Gujarat': 'গুজরাট',
    'Haryana': 'হরিয়ানা', 'Himachal Pradesh': 'হিমাচল প্রদেশ', 'Jharkhand': 'ঝাড়খণ্ড',
    'Karnataka': 'কর্ণাটক', 'Kerala': 'কেরল', 'Madhya Pradesh': 'মধ্যপ্রদেশ',
    'Maharashtra': 'মহারাষ্ট্র', 'Manipur': 'মণিপুর', 'Meghalaya': 'মেঘালয়',
    'Mizoram': 'মিজোরাম', 'Nagaland': 'নাগাল্যান্ড', 'Odisha': 'ওড়িশா', 'Punjab': 'পাঞ্জাব',
    'Rajasthan': 'রাজস্থান', 'Sikkim': 'সিকিম', 'Tamil Nadu': 'தமிழ்நாடு', 'Telangana': 'তেলেঙ্গানা',
    'Tripura': 'ত্রিপুরা', 'Uttarakhand': 'উত্তরাখণ্ড', 'Uttar Pradesh': 'উত্তর প্রদেশ',
    'West Bengal': 'পশ্চিমবঙ্গ', 'Andaman and Nicobar Islands': 'আন্দামান ও নিকোবর দ্বীপপুঞ্জ',
    'Chandigarh': 'চণ্ডীগড়', 'Dadra and Nagar Haveli and Daman and Diu': 'দাদরা ও নগর হাভেলি এবং দমন ও দিউ',
    'Delhi': 'দিল্লি', 'Jammu and Kashmir': 'জম্মু ও কাশ্মীর', 'Ladakh': 'লাদাখ',
    'Lakshadweep': 'লাক্ষাদ্বীপ', 'Puducherry': 'পুদুচেরি'
  },
  ta: {
    'Andhra Pradesh': 'ஆந்திரப் பிரதேசம்', 'Arunachal Pradesh': 'அருணாச்சலப் பிரதேசம்', 'Assam': 'அசாம்',
    'Bihar': 'பீகார்', 'Chhattisgarh': 'சத்தீஸ்கர்', 'Goa': 'கோவா', 'Gujarat': 'குஜராத்',
    'Haryana': 'ஹரியானா', 'Himachal Pradesh': 'இமாச்சலப் பிரதேசம்', 'Jharkhand': 'ஜார்க்கண்ட்',
    'Karnataka': 'கர்நாடகா', 'Kerala': 'கேரளா', 'Madhya Pradesh': 'மத்தியப் பிரதேசம்',
    'Maharashtra': 'மகாராஷ்டிரா', 'Manipur': 'மணிப்பூர்', 'Meghalaya': 'மேகாலயா',
    'Mizoram': 'மிசோரம்', 'Nagaland': 'நாகாலாந்து', 'Odisha': 'ஒடிசா', 'Punjab': 'பஞ்சாப்',
    'Rajasthan': 'ராஜஸ்தான்', 'Sikkim': 'சிக்கிம்', 'Tamil Nadu': 'தமிழ்நாடு', 'Telangana': 'தெலுங்கானா',
    'Tripura': 'திரிபுரா', 'Uttarakhand': 'உத்தரகண்ட்', 'Uttar Pradesh': 'உத்தரப் பிரதேசம்',
    'West Bengal': 'மேற்கு வங்கம்', 'Andaman and Nicobar Islands': 'அந்தமான் நிக்கோபார் தீவுகள்',
    'Chandigarh': 'சண்டிகர்', 'Dadra and Nagar Haveli and Daman and Diu': 'தாத்ரா நகர் ஹவேலி மற்றும் டாமன் டயூ',
    'Delhi': 'டெல்லி', 'Jammu and Kashmir': 'ஜம்மு காஷ்மீர்', 'Ladakh': 'லடாக்',
    'Lakshadweep': 'லட்சத்தீவு', 'Puducherry': 'புதுச்சேரி'
  }
};

const LOCALIZED_DISTRICTS: Record<Language, Record<string, string>> = {
  en: {
    'Kamrup Metropolitan': 'Kamrup Metro',
    'Dibrugarh': 'Dibrugarh',
    'Jorhat': 'Jorhat',
    'Cachar': 'Cachar',
    'Sonitpur': 'Sonitpur',
    'Bongaigaon': 'Bongaigaon',
    'East Khasi Hills': 'East Khasi Hills',
    'West Garo Hills': 'West Garo Hills',
    'Imphal West': 'Imphal West',
    'Imphal East': 'Imphal East'
  },
  hi: {
    'Kamrup Metropolitan': 'कामरूप मेट्रो',
    'Dibrugarh': 'डिब्रूगढ़',
    'Jorhat': 'जोरहाट',
    'Cachar': 'कछार',
    'Sonitpur': 'शोणितपुर',
    'Bongaigaon': 'बोंगाईगांव',
    'East Khasi Hills': 'पूर्वी खासी हिल्स',
    'West Garo Hills': 'पश्चिम गारो हिल्स',
    'Imphal West': 'इम्फाल पश्चिम',
    'Imphal East': 'इम्फाल पूर्व'
  },
  as: {
    'Kamrup Metropolitan': 'কামৰূপ মহানগৰ',
    'Dibrugarh': 'ডিব্ৰুগড়',
    'Jorhat': 'যোৰহাট',
    'Cachar': 'কাছাৰ',
    'Sonitpur': 'শোণিতপুৰ',
    'Bongaigaon': 'বঙাইগাঁও',
    'East Khasi Hills': 'পূব খাচী পাহাৰ',
    'West Garo Hills': 'পশ্চিম গাৰো পাহাৰ',
    'Imphal West': 'পশ্চিম ইম্ফল',
    'Imphal East': 'পূব ইম্ফল'
  },
  bn: {
    'Kamrup Metropolitan': 'কামরূপ মেট্রো',
    'Dibrugarh': 'ডিব্রুগড়',
    'Jorhat': 'যোরহাট',
    'Cachar': 'কাছাড়',
    'Sonitpur': 'শোণিতপুর',
    'Bongaigaon': 'বঙাইগাঁও',
    'East Khasi Hills': 'পূর্ব খাসি পাহাড়',
    'West Garo Hills': 'পশ্চিম গারো পাহাড়',
    'Imphal West': 'পশ্চিম ইম্ফল',
    'Imphal East': 'পূর্ব ইম্ফল'
  },
  ta: {
    'Kamrup Metropolitan': 'காம்ரூப் மெட்ரோ',
    'Dibrugarh': 'திப்ருகர்',
    'Jorhat': 'ஜோர்ஹாட்',
    'Cachar': 'கச்சார்',
    'Sonitpur': 'சோனித்பூர்',
    'Bongaigaon': 'போங்காய்கான்',
    'East Khasi Hills': 'கிழக்கு காசி மலைகள்',
    'West Garo Hills': 'மேற்கு காரோ மலைகள்',
    'Imphal West': 'மேற்கு இம்பால்',
    'Imphal East': 'கிழக்கு இம்பால்'
  }
};

const LOGIN_TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    signInTitle: 'Sign in to SAMADHAN',
    createAccTitle: 'Create your account',
    signInSubtitle: 'Track, dispute, and confirm public service issues in your district.',
    createAccSubtitle: 'Create an account to submit complaints, track progress, and confirm resolution.',
    fullName: 'Full Name *',
    fullNamePlaceholder: 'Enter your full name',
    mobileNumber: 'Mobile Number *',
    mobilePlaceholder: 'Enter your 10-digit mobile number',
    otpSimulated: 'Prototype OTP is simulated (Code: 123456)',
    emailAddress: 'Email Address (Optional)',
    emailPlaceholder: 'Enter your email address',
    stateText: 'State *',
    districtTextForm: 'District *',
    residenceAddress: 'Residential Address *',
    residencePlaceholder: 'Flat/House No, Building, Street',
    landmarkForm: 'Landmark (Optional)',
    landmarkPlaceholder: 'e.g. Near Temple',
    pincodeForm: 'Pincode *',
    pincodePlaceholder: '6 digits',
    createPassword: 'Create Password *',
    createPasswordPlaceholder: 'Create password',
    confirmPassword: 'Confirm Password *',
    confirmPasswordPlaceholder: 'Confirm password',
    agreeTermsLabel: 'I agree to the Terms of Use and understand that this is a prototype, not an official government service. No live agencies will be notified.',
    btnCreateAcc: 'Create Account',
    btnSignIn: 'Sign In',
    alreadyHaveAcc: 'Already have an account?',
    signInLink: 'Sign in',
    dontHaveAcc: "Don't have an account?",
    createAccountLink: 'Create account',
    safeSandboxNotice: 'This is a safe sandbox. Do not submit sensitive real credentials.',
    mobileError: 'Please enter a valid 10-digit mobile number.',
    residenceError: 'Please enter your residential address.',
    pincodeError: 'Please enter a valid 6-digit pincode.',
    passwordMismatchError: 'Passwords do not match.',
    termsError: 'You must agree to the Terms of Use to create an account.',
    requiredFieldsError: 'Please fill in all required fields.',
    signInFieldsError: 'Please enter both mobile number and password.'
  },
  hi: {
    signInTitle: 'समाधान में साइन इन करें',
    createAccTitle: 'अपना खाता बनाएं',
    signInSubtitle: 'अपने जिले में सार्वजनिक सेवा समस्याओं को ट्रैक करें, विवाद करें और पुष्टि करें।',
    createAccSubtitle: 'शिकायतें दर्ज करने, प्रगति को ट्रैक करने और समाधान की पुष्टि करने के लिए एक खाता बनाएं।',
    fullName: 'पूरा नाम *',
    fullNamePlaceholder: 'अपना पूरा नाम दर्ज करें',
    mobileNumber: 'मोबाइल नंबर *',
    mobilePlaceholder: 'अपना 10-अंकीय मोबाइल नंबर दर्ज करें',
    otpSimulated: 'प्रोटोटाइप ओटीपी सिम्युलेटेड है (कोड: 123456)',
    emailAddress: 'ईमेल पता (वैकल्पिक)',
    emailPlaceholder: 'अपना ईमेल पता दर्ज करें',
    stateText: 'राज्य *',
    districtTextForm: 'जिला *',
    residenceAddress: 'आवासीय पता *',
    residencePlaceholder: 'फ्लैट/मकान नंबर, भवन, सड़क',
    landmarkForm: 'सीमा चिन्ह (वैकल्पिक)',
    landmarkPlaceholder: 'जैसे: मंदिर के पास',
    pincodeForm: 'पिनकोड *',
    pincodePlaceholder: '6 अंक',
    createPassword: 'पासवर्ड बनाएं *',
    createPasswordPlaceholder: 'पासवर्ड बनाएं',
    confirmPassword: 'पासवर्ड की पुष्टि करें *',
    confirmPasswordPlaceholder: 'पासवर्ड की पुष्टि करें',
    agreeTermsLabel: 'मैं उपयोग की शर्तों से सहमत हूँ और समझता हूँ कि यह एक प्रोटोटाइप है, कोई वास्तविक सरकारी सेवा नहीं है।',
    btnCreateAcc: 'खाता बनाएं',
    btnSignIn: 'साइन इन करें',
    alreadyHaveAcc: 'पहले से खाता है?',
    signInLink: 'साइन इन करें',
    dontHaveAcc: 'खाता नहीं है?',
    createAccountLink: 'खाता बनाएं',
    safeSandboxNotice: 'यह एक सुरक्षित सैंडबॉक्स है। संवेदनशील वास्तविक क्रेडेंशियल जमा न करें।',
    mobileError: 'कृपया एक मान्य 10-अंकीय मोबाइल नंबर दर्ज करें।',
    residenceError: 'कृपया अपना आवासीय पता दर्ज करें।',
    pincodeError: 'कृपया एक मान्य 6-अंकीय पिनकोड दर्ज करें।',
    passwordMismatchError: 'पासवर्ड मेल नहीं खाते।',
    termsError: 'खाता बनाने के लिए आपको उपयोग की शर्तों से सहमत होना होगा।',
    requiredFieldsError: 'कृपया सभी आवश्यक फ़ील्ड भरें।',
    signInFieldsError: 'कृपया मोबाइल नंबर और पासवर्ड दोनों दर्ज करें।'
  },
  as: {
    signInTitle: 'সমাধানত ছাইন ইন কৰক',
    createAccTitle: 'আপোনাৰ একাউণ্ট সৃষ্টি কৰক',
    signInSubtitle: 'আপোনাৰ জিলাত ৰাজহুৱা সেৱাৰ সমস্যাসমূহ ট্ৰেক কৰক, বিতৰ্ক কৰক আৰু নিশ্চিত কৰক।',
    createAccSubtitle: 'অভিযোগ দাখিল কৰিবলৈ, ট্ৰেক কৰিবলৈ আৰু সমাধান নিশ্চিত কৰিবলৈ একাউণ্ট সৃষ্টি কৰক।',
    fullName: 'পূৰ্ণ নাম *',
    fullNamePlaceholder: 'আপোনাৰ পূৰ্ণ নাম লিখক',
    mobileNumber: 'ম’বাইল নম্বৰ *',
    mobilePlaceholder: '১০-অংকৰ ম’বাইল নম্বৰ লিখক',
    otpSimulated: 'প্ৰ’ট’টাইপ অ’টিপি প্ৰস্তুত কৰা হৈছে (ক’ড: ১২৩৪৫৬)',
    emailAddress: 'ইমেইল ঠিকনা (ঐচ্ছিক)',
    emailPlaceholder: 'আপোনাৰ ইমেইল ঠিকনা লিখক',
    stateText: 'ৰাজ্য *',
    districtTextForm: 'জিলা *',
    residenceAddress: 'আৱাসিক ঠিকনা *',
    residencePlaceholder: 'ফ্লেট/ঘৰ নম্বৰ, ভৱন, পথ',
    landmarkForm: 'সীমা চিহ্ন (ঐচ্ছিক)',
    landmarkPlaceholder: 'যেনে: মন্দিৰৰ ওচৰত',
    pincodeForm: 'পিনকোড *',
    pincodePlaceholder: '৬ টা সংখ্যা',
    createPassword: 'পাছৱৰ্ড সৃষ্টি কৰক *',
    createPasswordPlaceholder: 'পাছৱৰ্ড সৃষ্টি কৰক',
    confirmPassword: 'পাছৱৰ্ড নিশ্চিত কৰক *',
    confirmPasswordPlaceholder: 'পাছৱৰ্ড নিশ্চিত কৰক',
    agreeTermsLabel: 'মই ব্যৱহাৰৰ চৰ্তসমূহৰ সৈতে সন্মত আৰু বুজি পাইছোঁ যে এইটো এটা প্ৰ’ট’টাইপ, চৰকাৰী সেৱা নহয়।',
    btnCreateAcc: 'একাউণ্ট সৃষ্টি কৰক',
    btnSignIn: 'ছাইন ইন কৰক',
    alreadyHaveAcc: 'ইতিমধ্যে একাউণ্ট আছেনে?',
    signInLink: 'ছাইন ইন',
    dontHaveAcc: 'একাউণ্ট নাইনে?',
    createAccountLink: 'একাউণ্ট সৃষ্টি কৰক',
    safeSandboxNotice: 'এইটো এটা সুৰক্ষিত চেণ্ডবক্স। স্পৰ্শকাতৰ প্ৰকৃত ক্ৰেডেন্সিয়েল দাখিল নকৰিব।',
    mobileError: 'অনুগ্ৰহ কৰি এটা বৈধ ১০-অংকৰ ম’বাইল নম্বৰ লিখক।',
    residenceError: 'অনুগ্ৰহ কৰি আপোনাৰ আৱাসিক ঠিকনা লিখক।',
    pincodeError: 'অনুগ্ৰহ কৰি এটা বৈধ ৬-অংকৰ পিনকোড লিখক।',
    passwordMismatchError: 'পাছৱৰ্ড মিল খোৱা নাই।',
    termsError: 'একাউণ্ট সৃষ্টি কৰিবলৈ আপুনি ব্যৱহাৰৰ চৰ্তসমূহাত সন্মত হ’ব লাগিব।',
    requiredFieldsError: 'অনুগ্ৰহ কৰি সকলো প্ৰয়োজনীয় ফিল্ড পূৰণ কৰক।',
    signInFieldsError: 'অনুগ্ৰহ কৰি ম’বাইল নম্বৰ আৰু পাছৱৰ্ড দুয়োটা লিখক।'
  },
  bn: {
    signInTitle: 'সমাধানে সাইন ইন করুন',
    createAccTitle: 'আপনার অ্যাকাউন্ট তৈরি করুন',
    signInSubtitle: 'আপনার জেলার গণ পরিষেবা সংক্রান্ত সমস্যা ট্র্যাক করুন, বিতর্ক করুন এবং নিশ্চিত করুন।',
    createAccSubtitle: 'অভিযোগ দাখিল করতে, অগ্রগতি ট্র্যাক করতে এবং সমাধান নিশ্চিত করতে অ্যাকাউন্ট তৈরি করুন।',
    fullName: 'সম্পূর্ণ নাম *',
    fullNamePlaceholder: 'আপনার সম্পূর্ণ নাম লিখুন',
    mobileNumber: 'মোবাইল নম্বর *',
    mobilePlaceholder: 'আপনার ১০-সংখ্যার মোবাইল নম্বর লিখুন',
    otpSimulated: 'প্রোটোটাইপ ওটিপি সিমুলেটেড (কোড: ১২৩৪৫৬)',
    emailAddress: 'ইমেল ঠিকানা (ঐচ্ছিক)',
    emailPlaceholder: 'আপনার ইমেল ঠিকানা লিখুন',
    stateText: 'রাজ্য *',
    districtTextForm: 'জেলা *',
    residenceAddress: 'আবাসিক ঠিকানা *',
    residencePlaceholder: 'ফ্ল্যাট/বাড়ি নম্বর, ভবন, রাস্তা',
    landmarkForm: 'ল্যান্ডমার্ক (ঐচ্ছিক)',
    landmarkPlaceholder: 'যেমন: মন্দিরের কাছে',
    pincodeForm: 'পিনকোড *',
    pincodePlaceholder: '৬ টি সংখ্যা',
    createPassword: 'পাসওয়ার্ড তৈরি করুন *',
    createPasswordPlaceholder: 'পাসওয়ার্ড তৈরি করুন',
    confirmPassword: 'পাসওয়ার্ড নিশ্চিত করুন *',
    confirmPasswordPlaceholder: 'পাসওয়ার্ড নিশ্চিত করুন',
    agreeTermsLabel: 'আমি ব্যবহারের শর্তাবলীতে সম্মত এবং বুঝতে পারছি যে এটি একটি প্রোটোটাইপ, কোনো সরকারি পরিষেবা নয়।',
    btnCreateAcc: 'অ্যাকাউন্ট তৈরি করুন',
    btnSignIn: 'সাইন ইন করুন',
    alreadyHaveAcc: 'ইতিমধ্যে অ্যাকাউন্ট আছে?',
    signInLink: 'সাইন ইন',
    dontHaveAcc: 'অ্যাকাউন্ট নেই?',
    createAccountLink: 'অ্যাকাউন্ট তৈরি করুন',
    safeSandboxNotice: 'এটি একটি সুরক্ষিত স্যান্ডবক্স। সংবেদনশীল আসল শংসাপত্র জমা দেবেন না।',
    mobileError: 'অনুগ্রহ করে একটি বৈধ ১০-সংখ্যার মোবাইল নম্বর লিখুন।',
    residenceError: 'অনুগ্রহ করে আপনার আবাসিক ঠিকানা লিখুন।',
    pincodeError: 'অনুগ্রহ করে একটি বৈধ ৬-সংখ্যার পিনকোড লিখুন।',
    passwordMismatchError: 'পাসওয়ার্ড মিলছে না।',
    termsError: 'অ্যাকাউন্ট তৈরি করতে আপনাকে ব্যবহারের শর্তাবলীতে সম্মত হতে হবে।',
    requiredFieldsError: 'অনুগ্রহ করে সব প্রয়োজনীয় ফিল্ড পূরণ করুন।',
    signInFieldsError: 'অনুগ্রহ করে মোবাইল নম্বর এবং পাসওয়ার্ড উভয়ই লিখুন।'
  },
  ta: {
    signInTitle: 'சமாதானில் உள்நுழையவும்',
    createAccTitle: 'உங்கள் கணக்கை உருவாக்கவும்',
    signInSubtitle: 'உங்கள் மாவட்டத்தின் பொதுச் சேவைப் பிரச்சினைகளைக் கண்காணிக்கவும், தீர்க்கவும் மற்றும் உறுதிப்படுத்தவும்.',
    createAccSubtitle: 'புகார்களைச் சமர்ப்பிக்கவும், கண்காணிக்கவும் மற்றும் தீர்வை உறுதிப்படுத்தவும் கணக்கை உருவாக்கவும்.',
    fullName: 'முழு பெயர் *',
    fullNamePlaceholder: 'உங்கள் முழு பெயரை உள்ளிடவும்',
    mobileNumber: 'கைபேசி எண் *',
    mobilePlaceholder: 'உங்கள் 10-இலக்க கைபேசி எண்ணை உள்ளிடவும்',
    otpSimulated: 'மாதிரி OTP உருவகப்படுத்தப்பட்டுள்ளது (குறியீடு: 123456)',
    emailAddress: 'மின்னஞ்சல் முகவரி (விருப்பத்தேர்வு)',
    emailPlaceholder: 'உங்கள் மின்னஞ்சல் முகவரியை உள்ளிடவும்',
    stateText: 'மாநிலம் *',
    districtTextForm: 'மாவட்டம் *',
    residenceAddress: 'இருப்பிட முகவரி *',
    residencePlaceholder: 'பிளாட்/வீட்டு எண், கட்டிடம், தெரு',
    landmarkForm: 'அடையாளம் (விருப்பத்தேர்வு)',
    landmarkPlaceholder: 'எ.கா. கோயிலுக்கு அருகில்',
    pincodeForm: 'அஞ்சல் குறியீடு *',
    pincodePlaceholder: '6 இலக்கங்கள்',
    createPassword: 'கடவுச்சொல்லை உருவாக்கவும் *',
    createPasswordPlaceholder: 'கடவுச்சொல்லை உருவாக்கவும்',
    confirmPassword: 'கடவுச்சொல்லை உறுதிப்படுத்தவும் *',
    confirmPasswordPlaceholder: 'கடவுச்சொல்லை உறுதிப்படுத்தவும்',
    agreeTermsLabel: 'பயன்பாட்டு விதிமுறைகளை நான் ஒப்புக்கொள்கிறேன், மேலும் இது ஒரு மாதிரி, அதிகாரப்பூர்வ அரசு சேவை அல்ல என்பதைப் புரிந்துகொள்கிறேன்.',
    btnCreateAcc: 'கணக்கை உருவாக்கவும்',
    btnSignIn: 'உள்நுழையவும்',
    alreadyHaveAcc: 'ஏற்கனவே கணக்கு உள்ளதா?',
    signInLink: 'உள்நுழையவும்',
    dontHaveAcc: 'கணக்கு இல்லையா?',
    createAccountLink: 'கணக்கை உருவாக்கவும்',
    safeSandboxNotice: 'இது ஒரு பாதுகாப்பான சாண்ட்பாக்ஸ் ஆகும். முக்கிய நற்சான்றிதழ்களைச் சமர்ப்பிக்க வேண்டாம்.',
    mobileError: 'தயவுசெய்து செல்லுபடியாகும் 10 இலக்க கைபேசி எண்ணை உள்ளிடவும்.',
    residenceError: 'தயவுசெய்து உங்கள் இருப்பிட முகவரியை உள்ளிடவும்.',
    pincodeError: 'தயவுசெய்து செல்லுபடியாகும் 6 இலக்க அஞ்சல் குறியீட்டை உள்ளிடவும்.',
    passwordMismatchError: 'கடவுச்சொற்கள் பொருந்தவில்லை.',
    termsError: 'கணக்கை உருவாக்க நீங்கள் பயன்பாட்டு விதிமுறைகளை ஒப்புக்கொள்ள வேண்டும்.',
    requiredFieldsError: 'தயவுசெய்து தேவையான அனைத்து புலங்களையும் நிரப்பவும்.',
    signInFieldsError: 'தயவுசெய்து கைபேசி எண் மற்றும் கடவுச்சொல் இரண்டையும் உள்ளிடவும்.'
  }
};



export const Login: React.FC<LoginProps> = ({ language, setLanguage, onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Registration States
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState('Assam');
  const [district, setDistrict] = useState('Kamrup Metropolitan');
  const [residence, setResidence] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [formError, setFormError] = useState('');

  // Sign In States
  const [signInMobile, setSignInMobile] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Password Visibility States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  const t = LOGIN_TRANSLATIONS[language] || LOGIN_TRANSLATIONS.en;

  // Sync default district if state changes
  useEffect(() => {
    if (STATES_AND_DISTRICTS[state]) {
      setDistrict(STATES_AND_DISTRICTS[state][0]);
    }
  }, [state]);

  const handleDemoLogin = async () => {
    const demoProfile = await authService.signInDemoUser(language);
    onLoginSuccess(demoProfile);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name || !mobile || !password || !confirmPassword || !residence || !pincode) {
      setFormError(t.requiredFieldsError);
      return;
    }

    if (mobile.length !== 10 || isNaN(Number(mobile))) {
      setFormError(t.mobileError);
      return;
    }

    if (!residence.trim()) {
      setFormError(t.residenceError);
      return;
    }

    if (pincode.length !== 6 || isNaN(Number(pincode))) {
      setFormError(t.pincodeError);
      return;
    }

    if (password !== confirmPassword) {
      setFormError(t.passwordMismatchError);
      return;
    }

    if (!agreeTerms) {
      setFormError(t.termsError);
      return;
    }

    const profile: UserProfile = {
      name,
      mobile,
      email: email || undefined,
      state,
      district,
      preferredLanguage: language,
      onboardingCompleted: false,
      residence,
      landmark: landmark || undefined,
      pincode
    };

    try {
      const { user: registeredUser, error: regError } = await authService.signUp(profile, password);
      if (regError) {
        setFormError(regError);
        return;
      }
      onLoginSuccess(registeredUser || profile);
    } finally {
      // Clear sensitive password inputs from memory
      setPassword('');
      setConfirmPassword('');
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!signInMobile || !signInPassword) {
      setFormError(t.signInFieldsError);
      return;
    }

    try {
      const { user: authUser, error: authError } = await authService.signInWithPassword(signInMobile, signInPassword);
      if (authError || !authUser) {
        setFormError(authError || (language === 'hi' ? 'लॉगिन विफल रहा।' : 'Sign in failed. Please check your credentials.'));
        return;
      }
      onLoginSuccess(authUser);
    } finally {
      // Clear password from memory
      setSignInPassword('');
    }
  };

  return (
    <div style={{
      maxWidth: '450px',
      margin: '2rem auto',
      padding: '0 1rem'
    }} className="animate-fade-in">
      
      {/* Brand Header - No skew */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{
          background: 'var(--color-primary)',
          color: '#FFFFFF',
          width: '64px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: '2.2rem',
          borderRadius: '12px',
          margin: '0 auto 1rem auto',
          boxShadow: '0 10px 15px -3px rgba(95, 62, 43, 0.25)'
        }}>
          <span>S</span>
        </div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem', letterSpacing: '-0.03em', color: 'var(--color-primary)' }}>
          {language === 'hi' ? 'समाधान' : 'SAMADHAN'}
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', fontStyle: 'italic', margin: 0 }}>
          {language === 'hi' ? '"सार्वजनिक सेवा समस्याओं को हल करने का एक सरल तरीका।"' : '"A simpler way to resolve public-service problems."'}
        </p>
      </div>

      {/* Main card box - Solid brown card with white text details */}
      <Parallelogram
        wrapperClassName="card-wrapper"
        style={{
          background: 'var(--bg-card)',
          padding: '2rem',
          border: '1.5px solid var(--bg-card)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Language selector on top of the card */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '0.8rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-on-card-muted)', fontWeight: 600 }}>Language / भाषा:</span>
          <div style={{ width: '145px' }}>
            <CustomSelect
              value={language}
              onChange={(val) => setLanguage(val as Language)}
              options={[
                { value: 'en', label: 'English' },
                { value: 'hi', label: 'हिन्दी (Hindi)' },
                { value: 'as', label: 'অসমীয়া (Assamese)' },
                { value: 'bn', label: 'বাংলা (Bengali)' },
                { value: 'ta', label: 'தமிழ் (Tamil)' }
              ]}
              icon={<Globe size={14} style={{ color: 'var(--color-text-on-card-muted)' }} />}
            />
          </div>
        </div>

        <h2 style={{ fontSize: '1.3rem', marginBottom: '0.4rem', color: '#FFFFFF' }}>
          {isRegistering ? t.createAccTitle : t.signInTitle}
        </h2>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-on-card-muted)', marginBottom: '1.2rem', lineHeight: '1.4' }}>
          {isRegistering ? t.createAccSubtitle : t.signInSubtitle}
        </p>

        {/* Demo trigger banner */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: '1.5px dashed rgba(255, 255, 255, 0.4)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.2rem',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', color: '#FFFFFF', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
            <Sparkles size={16} />
            {language === 'hi' ? 'त्वरित समीक्षा खाता' : 'QUICK-REVIEW ACCESS'}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-on-card-muted)', marginBottom: '0.8rem' }}>
            {language === 'hi' ? 'पहले से लोड की गई शिकायतों के साथ सीधे पोर्टल पर जाएं।' : 'Instantly access the citizen portal with pre-loaded complaints.'}
          </p>
          <button 
            type="button" 
            className="btn-secondary"
            onClick={handleDemoLogin}
            style={{ width: '100%', borderRadius: '12px', padding: '0.6rem 1rem', fontSize: '0.85rem' }}
          >
            {language === 'hi' ? 'डेमो खाता आज़माएं' : 'Try Demo Account'}
          </button>
        </div>

        {/* Traditional login/registration split */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0', color: 'var(--color-text-on-card-muted)' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
          <span style={{ padding: '0 0.5rem', fontSize: '0.7rem', fontWeight: 700 }}>
            {language === 'hi' ? 'या फॉर्म भरें' : 'OR USE FORM'}
          </span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
        </div>

        {isRegistering ? (
          // Register form
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="form-label" style={{ color: '#FFFFFF' }}>{t.fullName}</label>
              <div className="form-input-wrapper" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                <User size={18} style={{ color: 'var(--color-text-on-card-muted)', marginRight: '0.5rem' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder={t.fullNamePlaceholder}
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ color: '#FFFFFF' }}
                />
              </div>
            </div>

            <div>
              <label className="form-label" style={{ color: '#FFFFFF' }}>{t.mobileNumber}</label>
              <div className="form-input-wrapper" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                <Phone size={18} style={{ color: 'var(--color-text-on-card-muted)', marginRight: '0.5rem' }} />
                <input
                  type="tel"
                  className="form-input"
                  placeholder={t.mobilePlaceholder}
                  maxLength={10}
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  style={{ color: '#FFFFFF' }}
                />
              </div>
              <span style={{ fontSize: '0.65rem', color: 'var(--color-text-on-card-muted)', display: 'block', marginTop: '0.2rem' }}>
                {t.otpSimulated}
              </span>
            </div>

            <div>
              <label className="form-label" style={{ color: '#FFFFFF' }}>{t.emailAddress}</label>
              <div className="form-input-wrapper" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                <Mail size={18} style={{ color: 'var(--color-text-on-card-muted)', marginRight: '0.5rem' }} />
                <input
                  type="email"
                  className="form-input"
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ color: '#FFFFFF' }}
                />
              </div>
            </div>

            {/* Cascading State & District selectors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div>
                <label className="form-label" style={{ color: '#FFFFFF' }}>{t.stateText}</label>
                <CustomSelect
                  value={state}
                  onChange={setState}
                  options={Object.keys(STATES_AND_DISTRICTS).map(st => ({
                    value: st,
                    label: LOCALIZED_STATES[language][st] || st
                  }))}
                  icon={<MapPin size={16} style={{ color: 'var(--color-text-on-card-muted)' }} />}
                />
              </div>

              <div>
                <label className="form-label" style={{ color: '#FFFFFF' }}>{t.districtTextForm}</label>
                <CustomSelect
                  value={district}
                  onChange={setDistrict}
                  options={STATES_AND_DISTRICTS[state].map(dist => ({
                    value: dist,
                    label: LOCALIZED_DISTRICTS[language][dist] || dist
                  }))}
                  icon={<MapPin size={16} style={{ color: 'var(--color-text-on-card-muted)' }} />}
                />
              </div>
            </div>

            <div>
              <label className="form-label" style={{ color: '#FFFFFF' }}>{t.residenceAddress}</label>
              <div className="form-input-wrapper" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                <MapPin size={18} style={{ color: 'var(--color-text-on-card-muted)', marginRight: '0.5rem' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder={t.residencePlaceholder}
                  required
                  value={residence}
                  onChange={(e) => setResidence(e.target.value)}
                  style={{ color: '#FFFFFF' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div>
                <label className="form-label" style={{ color: '#FFFFFF' }}>{t.landmarkForm}</label>
                <div className="form-input-wrapper" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={t.landmarkPlaceholder}
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    style={{ color: '#FFFFFF' }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ color: '#FFFFFF' }}>{t.pincodeForm}</label>
                <div className="form-input-wrapper" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={t.pincodePlaceholder}
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    style={{ color: '#FFFFFF' }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="form-label" style={{ color: '#FFFFFF' }}>{t.createPassword}</label>
              <div className="form-input-wrapper" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.2)', position: 'relative' }}>
                <Lock size={18} style={{ color: 'var(--color-text-on-card-muted)', marginRight: '0.5rem' }} />
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder={t.createPasswordPlaceholder}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ color: '#FFFFFF', paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-on-card-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="form-label" style={{ color: '#FFFFFF' }}>{t.confirmPassword}</label>
              <div className="form-input-wrapper" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.2)', position: 'relative' }}>
                <Lock size={18} style={{ color: 'var(--color-text-on-card-muted)', marginRight: '0.5rem' }} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-input"
                  placeholder={t.confirmPasswordPlaceholder}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ color: '#FFFFFF', paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-on-card-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginTop: '0.3rem' }}>
              <input
                type="checkbox"
                id="agree-terms"
                style={{ marginTop: '0.2rem', cursor: 'pointer' }}
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <label htmlFor="agree-terms" style={{ fontSize: '0.7rem', color: 'var(--color-text-on-card-muted)', cursor: 'pointer', lineHeight: 1.3 }}>
                {t.agreeTermsLabel}
              </label>
            </div>

            {/* Error Message rendered immediately above the submit button */}
            {formError && (
              <div style={{
                backgroundColor: 'var(--color-attention-bg)',
                border: '1px solid var(--color-attention-border)',
                borderRadius: '12px',
                padding: '0.6rem 0.8rem',
                color: 'var(--color-attention-text)',
                fontSize: '0.75rem',
                marginTop: '0.5rem',
                fontWeight: 600
              }}>
                {formError}
              </div>
            )}

            <button 
              type="submit" 
              className="btn-secondary" 
              style={{ width: '100%', borderRadius: '12px', marginTop: '0.5rem' }}
            >
              {t.btnCreateAcc}
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-on-card-muted)' }}>
                {t.alreadyHaveAcc}{' '}
                <button 
                  type="button" 
                  onClick={() => { setIsRegistering(false); setFormError(''); }}
                  style={{ background: 'none', border: 'none', color: '#FFFFFF', fontWeight: 'bold', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  {t.signInLink}
                </button>
              </span>
            </div>
          </form>
        ) : (
          // Sign in form
          <form onSubmit={handleSignInSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label className="form-label" style={{ color: '#FFFFFF' }}>{language === 'hi' ? 'मोबाइल नंबर *' : 'Mobile Number *'}</label>
              <div className="form-input-wrapper" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                <Phone size={18} style={{ color: 'var(--color-text-on-card-muted)', marginRight: '0.5rem' }} />
                <input
                  type="tel"
                  className="form-input"
                  placeholder={t.mobilePlaceholder}
                  maxLength={10}
                  required
                  value={signInMobile}
                  onChange={(e) => setSignInMobile(e.target.value.replace(/\D/g, ''))}
                  style={{ color: '#FFFFFF' }}
                />
              </div>
            </div>

            <div>
              <label className="form-label" style={{ color: '#FFFFFF' }}>{language === 'hi' ? 'पासवर्ड *' : 'Password *'}</label>
              <div className="form-input-wrapper" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.2)', position: 'relative' }}>
                <Lock size={18} style={{ color: 'var(--color-text-on-card-muted)', marginRight: '0.5rem' }} />
                <input
                  type={showSignInPassword ? "text" : "password"}
                  className="form-input"
                  placeholder={language === 'hi' ? 'अपना पासवर्ड दर्ज करें' : 'Enter your password'}
                  required
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  style={{ color: '#FFFFFF', paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowSignInPassword(!showSignInPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-on-card-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  {showSignInPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error Message rendered immediately above the submit button */}
            {formError && (
              <div style={{
                backgroundColor: 'var(--color-attention-bg)',
                border: '1px solid var(--color-attention-border)',
                borderRadius: '12px',
                padding: '0.6rem 0.8rem',
                color: 'var(--color-attention-text)',
                fontSize: '0.75rem',
                marginTop: '0.2rem',
                fontWeight: 600
              }}>
                {formError}
              </div>
            )}

            <button 
              type="submit" 
              className="btn-secondary" 
              style={{ width: '100%', borderRadius: '12px', marginTop: '0.5rem' }}
            >
              {t.btnSignIn}
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-on-card-muted)' }}>
                {t.dontHaveAcc}{' '}
                <button 
                  type="button" 
                  onClick={() => { setIsRegistering(true); setFormError(''); }}
                  style={{ background: 'none', border: 'none', color: '#FFFFFF', fontWeight: 'bold', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  {t.createAccountLink}
                </button>
              </span>
            </div>
          </form>
        )}
      </Parallelogram>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: '0.3rem', 
        color: 'var(--color-text-muted)', 
        fontSize: '0.75rem', 
        marginTop: '1.5rem',
        textAlign: 'center' 
      }}>
        <ShieldAlert size={14} />
        {t.safeSandboxNotice}
      </div>
    </div>
  );
};
