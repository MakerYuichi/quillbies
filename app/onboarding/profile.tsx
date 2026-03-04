import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Alert,
  Modal,
  BackHandler,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { ChakraPetch_400Regular, ChakraPetch_600SemiBold } from '@expo-google-fonts/chakra-petch';
import * as Localization from 'expo-localization';
import * as Location from 'expo-location';
import { useQuillbyStore } from '../state/store-modular';
import { playTabSound, playUISubmitSound } from '../../lib/soundManager';

// Get screen dimensions for responsive layout
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Country to Timezone mapping - Comprehensive list for all countries
const COUNTRY_TIMEZONES: Record<string, string[]> = {
  'AF': ['Asia/Kabul'],
  'AL': ['Europe/Tirane'],
  'DZ': ['Africa/Algiers'],
  'AD': ['Europe/Andorra'],
  'AO': ['Africa/Luanda'],
  'AG': ['America/Antigua'],
  'AR': ['America/Argentina/Buenos_Aires', 'America/Argentina/Cordoba', 'America/Argentina/Salta'],
  'AM': ['Asia/Yerevan'],
  'AU': ['Australia/Sydney', 'Australia/Melbourne', 'Australia/Brisbane', 'Australia/Adelaide', 'Australia/Perth', 'Australia/Darwin'],
  'AT': ['Europe/Vienna'],
  'AZ': ['Asia/Baku'],
  'BS': ['America/Nassau'],
  'BH': ['Asia/Bahrain'],
  'BD': ['Asia/Dhaka'],
  'BB': ['America/Barbados'],
  'BY': ['Europe/Minsk'],
  'BE': ['Europe/Brussels'],
  'BZ': ['America/Belize'],
  'BJ': ['Africa/Porto-Novo'],
  'BT': ['Asia/Thimphu'],
  'BO': ['America/La_Paz'],
  'BA': ['Europe/Sarajevo'],
  'BW': ['Africa/Gaborone'],
  'BR': ['America/Sao_Paulo', 'America/Manaus', 'America/Fortaleza', 'America/Recife', 'America/Belem'],
  'BN': ['Asia/Brunei'],
  'BG': ['Europe/Sofia'],
  'BF': ['Africa/Ouagadougou'],
  'BI': ['Africa/Bujumbura'],
  'KH': ['Asia/Phnom_Penh'],
  'CM': ['Africa/Douala'],
  'CA': ['America/Toronto', 'America/Vancouver', 'America/Edmonton', 'America/Winnipeg', 'America/Halifax', 'America/St_Johns'],
  'CV': ['Atlantic/Cape_Verde'],
  'CF': ['Africa/Bangui'],
  'TD': ['Africa/Ndjamena'],
  'CL': ['America/Santiago', 'Pacific/Easter'],
  'CN': ['Asia/Shanghai', 'Asia/Urumqi'],
  'CO': ['America/Bogota'],
  'KM': ['Indian/Comoro'],
  'CG': ['Africa/Brazzaville'],
  'CR': ['America/Costa_Rica'],
  'HR': ['Europe/Zagreb'],
  'CU': ['America/Havana'],
  'CY': ['Asia/Nicosia'],
  'CZ': ['Europe/Prague'],
  'DK': ['Europe/Copenhagen'],
  'DJ': ['Africa/Djibouti'],
  'DM': ['America/Dominica'],
  'DO': ['America/Santo_Domingo'],
  'EC': ['America/Guayaquil', 'Pacific/Galapagos'],
  'EG': ['Africa/Cairo'],
  'SV': ['America/El_Salvador'],
  'GQ': ['Africa/Malabo'],
  'ER': ['Africa/Asmara'],
  'EE': ['Europe/Tallinn'],
  'ET': ['Africa/Addis_Ababa'],
  'FJ': ['Pacific/Fiji'],
  'FI': ['Europe/Helsinki'],
  'FR': ['Europe/Paris'],
  'GA': ['Africa/Libreville'],
  'GM': ['Africa/Banjul'],
  'GE': ['Asia/Tbilisi'],
  'DE': ['Europe/Berlin'],
  'GH': ['Africa/Accra'],
  'GR': ['Europe/Athens'],
  'GD': ['America/Grenada'],
  'GT': ['America/Guatemala'],
  'GN': ['Africa/Conakry'],
  'GW': ['Africa/Bissau'],
  'GY': ['America/Guyana'],
  'HT': ['America/Port-au-Prince'],
  'HN': ['America/Tegucigalpa'],
  'HU': ['Europe/Budapest'],
  'IS': ['Atlantic/Reykjavik'],
  'IN': ['Asia/Kolkata'],
  'ID': ['Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura'],
  'IR': ['Asia/Tehran'],
  'IQ': ['Asia/Baghdad'],
  'IE': ['Europe/Dublin'],
  'IL': ['Asia/Jerusalem'],
  'IT': ['Europe/Rome'],
  'JM': ['America/Jamaica'],
  'JP': ['Asia/Tokyo'],
  'JO': ['Asia/Amman'],
  'KZ': ['Asia/Almaty', 'Asia/Aqtobe'],
  'KE': ['Africa/Nairobi'],
  'KI': ['Pacific/Tarawa'],
  'KP': ['Asia/Pyongyang'],
  'KW': ['Asia/Kuwait'],
  'KG': ['Asia/Bishkek'],
  'LA': ['Asia/Vientiane'],
  'LV': ['Europe/Riga'],
  'LB': ['Asia/Beirut'],
  'LS': ['Africa/Maseru'],
  'LR': ['Africa/Monrovia'],
  'LY': ['Africa/Tripoli'],
  'LI': ['Europe/Vaduz'],
  'LT': ['Europe/Vilnius'],
  'LU': ['Europe/Luxembourg'],
  'MG': ['Indian/Antananarivo'],
  'MW': ['Africa/Blantyre'],
  'MY': ['Asia/Kuala_Lumpur'],
  'MV': ['Indian/Maldives'],
  'ML': ['Africa/Bamako'],
  'MT': ['Europe/Malta'],
  'MH': ['Pacific/Majuro'],
  'MR': ['Africa/Nouakchott'],
  'MU': ['Indian/Mauritius'],
  'MX': ['America/Mexico_City', 'America/Cancun', 'America/Tijuana', 'America/Monterrey'],
  'FM': ['Pacific/Pohnpei'],
  'MD': ['Europe/Chisinau'],
  'MC': ['Europe/Monaco'],
  'MN': ['Asia/Ulaanbaatar'],
  'ME': ['Europe/Podgorica'],
  'MA': ['Africa/Casablanca'],
  'MZ': ['Africa/Maputo'],
  'MM': ['Asia/Yangon'],
  'NA': ['Africa/Windhoek'],
  'NR': ['Pacific/Nauru'],
  'NP': ['Asia/Kathmandu'],
  'NL': ['Europe/Amsterdam'],
  'NZ': ['Pacific/Auckland', 'Pacific/Chatham'],
  'NI': ['America/Managua'],
  'NE': ['Africa/Niamey'],
  'NG': ['Africa/Lagos'],
  'MK': ['Europe/Skopje'],
  'NO': ['Europe/Oslo'],
  'OM': ['Asia/Muscat'],
  'PK': ['Asia/Karachi'],
  'PW': ['Pacific/Palau'],
  'PS': ['Asia/Gaza', 'Asia/Hebron'],
  'PA': ['America/Panama'],
  'PG': ['Pacific/Port_Moresby'],
  'PY': ['America/Asuncion'],
  'PE': ['America/Lima'],
  'PH': ['Asia/Manila'],
  'PL': ['Europe/Warsaw'],
  'PT': ['Europe/Lisbon', 'Atlantic/Azores'],
  'QA': ['Asia/Qatar'],
  'RO': ['Europe/Bucharest'],
  'RU': ['Europe/Moscow', 'Asia/Vladivostok', 'Asia/Yekaterinburg', 'Asia/Novosibirsk'],
  'RW': ['Africa/Kigali'],
  'KN': ['America/St_Kitts'],
  'LC': ['America/St_Lucia'],
  'VC': ['America/St_Vincent'],
  'WS': ['Pacific/Apia'],
  'SM': ['Europe/San_Marino'],
  'ST': ['Africa/Sao_Tome'],
  'SA': ['Asia/Riyadh'],
  'SN': ['Africa/Dakar'],
  'RS': ['Europe/Belgrade'],
  'SC': ['Indian/Mahe'],
  'SL': ['Africa/Freetown'],
  'SG': ['Asia/Singapore'],
  'SK': ['Europe/Bratislava'],
  'SI': ['Europe/Ljubljana'],
  'SB': ['Pacific/Guadalcanal'],
  'SO': ['Africa/Mogadishu'],
  'ZA': ['Africa/Johannesburg'],
  'KR': ['Asia/Seoul'],
  'SS': ['Africa/Juba'],
  'ES': ['Europe/Madrid', 'Atlantic/Canary'],
  'LK': ['Asia/Colombo'],
  'SD': ['Africa/Khartoum'],
  'SR': ['America/Paramaribo'],
  'SE': ['Europe/Stockholm'],
  'CH': ['Europe/Zurich'],
  'SY': ['Asia/Damascus'],
  'TW': ['Asia/Taipei'],
  'TJ': ['Asia/Dushanbe'],
  'TZ': ['Africa/Dar_es_Salaam'],
  'TH': ['Asia/Bangkok'],
  'TL': ['Asia/Dili'],
  'TG': ['Africa/Lome'],
  'TO': ['Pacific/Tongatapu'],
  'TT': ['America/Port_of_Spain'],
  'TN': ['Africa/Tunis'],
  'TR': ['Europe/Istanbul'],
  'TM': ['Asia/Ashgabat'],
  'TV': ['Pacific/Funafuti'],
  'UG': ['Africa/Kampala'],
  'UA': ['Europe/Kiev'],
  'AE': ['Asia/Dubai'],
  'UK': ['Europe/London'],
  'US': ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Anchorage', 'Pacific/Honolulu'],
  'UY': ['America/Montevideo'],
  'UZ': ['Asia/Tashkent'],
  'VU': ['Pacific/Efate'],
  'VA': ['Europe/Vatican'],
  'VE': ['America/Caracas'],
  'VN': ['Asia/Ho_Chi_Minh'],
  'YE': ['Asia/Aden'],
  'ZM': ['Africa/Lusaka'],
  'ZW': ['Africa/Harare'],
  'OTHER': ['UTC'],
};

// Timezone display names - Comprehensive list
const TIMEZONE_NAMES: Record<string, string> = {
  // Americas
  'America/New_York': 'Eastern Time (EST/EDT)',
  'America/Chicago': 'Central Time (CST/CDT)',
  'America/Denver': 'Mountain Time (MST/MDT)',
  'America/Los_Angeles': 'Pacific Time (PST/PDT)',
  'America/Anchorage': 'Alaska Time (AKST/AKDT)',
  'Pacific/Honolulu': 'Hawaii Time (HST)',
  'America/Toronto': 'Eastern Time (EST/EDT)',
  'America/Vancouver': 'Pacific Time (PST/PDT)',
  'America/Edmonton': 'Mountain Time (MST/MDT)',
  'America/Winnipeg': 'Central Time (CST/CDT)',
  'America/Halifax': 'Atlantic Time (AST/ADT)',
  'America/St_Johns': 'Newfoundland Time (NST/NDT)',
  'America/Mexico_City': 'Central Time (CST/CDT)',
  'America/Cancun': 'Eastern Time (EST)',
  'America/Tijuana': 'Pacific Time (PST/PDT)',
  'America/Monterrey': 'Central Time (CST/CDT)',
  'America/Sao_Paulo': 'Brasília Time (BRT/BRST)',
  'America/Manaus': 'Amazon Time (AMT)',
  'America/Fortaleza': 'Brasília Time (BRT)',
  'America/Recife': 'Brasília Time (BRT)',
  'America/Belem': 'Brasília Time (BRT)',
  'America/Argentina/Buenos_Aires': 'Argentina Time (ART)',
  'America/Argentina/Cordoba': 'Argentina Time (ART)',
  'America/Argentina/Salta': 'Argentina Time (ART)',
  'America/Santiago': 'Chile Time (CLT/CLST)',
  'Pacific/Easter': 'Easter Island Time (EAST/EASST)',
  'America/Bogota': 'Colombia Time (COT)',
  'America/Lima': 'Peru Time (PET)',
  'America/Caracas': 'Venezuela Time (VET)',
  'America/La_Paz': 'Bolivia Time (BOT)',
  'America/Guayaquil': 'Ecuador Time (ECT)',
  'Pacific/Galapagos': 'Galapagos Time (GALT)',
  'America/Asuncion': 'Paraguay Time (PYT/PYST)',
  'America/Montevideo': 'Uruguay Time (UYT)',
  'America/Costa_Rica': 'Central Time (CST)',
  'America/Panama': 'Eastern Time (EST)',
  'America/Guatemala': 'Central Time (CST)',
  'America/El_Salvador': 'Central Time (CST)',
  'America/Tegucigalpa': 'Central Time (CST)',
  'America/Managua': 'Central Time (CST)',
  'America/Belize': 'Central Time (CST)',
  'America/Havana': 'Cuba Time (CST/CDT)',
  'America/Jamaica': 'Eastern Time (EST)',
  'America/Port-au-Prince': 'Eastern Time (EST/EDT)',
  'America/Santo_Domingo': 'Atlantic Time (AST)',
  'America/Nassau': 'Eastern Time (EST/EDT)',
  'America/Barbados': 'Atlantic Time (AST)',
  'America/Antigua': 'Atlantic Time (AST)',
  'America/Dominica': 'Atlantic Time (AST)',
  'America/Grenada': 'Atlantic Time (AST)',
  'America/St_Kitts': 'Atlantic Time (AST)',
  'America/St_Lucia': 'Atlantic Time (AST)',
  'America/St_Vincent': 'Atlantic Time (AST)',
  'America/Port_of_Spain': 'Atlantic Time (AST)',
  'America/Guyana': 'Guyana Time (GYT)',
  'America/Paramaribo': 'Suriname Time (SRT)',
  
  // Europe
  'Europe/London': 'Greenwich Mean Time (GMT/BST)',
  'Europe/Dublin': 'Greenwich Mean Time (GMT/IST)',
  'Europe/Paris': 'Central European Time (CET/CEST)',
  'Europe/Berlin': 'Central European Time (CET/CEST)',
  'Europe/Rome': 'Central European Time (CET/CEST)',
  'Europe/Madrid': 'Central European Time (CET/CEST)',
  'Atlantic/Canary': 'Western European Time (WET/WEST)',
  'Europe/Amsterdam': 'Central European Time (CET/CEST)',
  'Europe/Brussels': 'Central European Time (CET/CEST)',
  'Europe/Vienna': 'Central European Time (CET/CEST)',
  'Europe/Zurich': 'Central European Time (CET/CEST)',
  'Europe/Stockholm': 'Central European Time (CET/CEST)',
  'Europe/Oslo': 'Central European Time (CET/CEST)',
  'Europe/Copenhagen': 'Central European Time (CET/CEST)',
  'Europe/Helsinki': 'Eastern European Time (EET/EEST)',
  'Europe/Warsaw': 'Central European Time (CET/CEST)',
  'Europe/Prague': 'Central European Time (CET/CEST)',
  'Europe/Budapest': 'Central European Time (CET/CEST)',
  'Europe/Bucharest': 'Eastern European Time (EET/EEST)',
  'Europe/Athens': 'Eastern European Time (EET/EEST)',
  'Europe/Sofia': 'Eastern European Time (EET/EEST)',
  'Europe/Istanbul': 'Turkey Time (TRT)',
  'Europe/Kiev': 'Eastern European Time (EET/EEST)',
  'Europe/Minsk': 'Moscow Time (MSK)',
  'Europe/Moscow': 'Moscow Time (MSK)',
  'Europe/Lisbon': 'Western European Time (WET/WEST)',
  'Atlantic/Azores': 'Azores Time (AZOT/AZOST)',
  'Europe/Tallinn': 'Eastern European Time (EET/EEST)',
  'Europe/Riga': 'Eastern European Time (EET/EEST)',
  'Europe/Vilnius': 'Eastern European Time (EET/EEST)',
  'Europe/Belgrade': 'Central European Time (CET/CEST)',
  'Europe/Zagreb': 'Central European Time (CET/CEST)',
  'Europe/Ljubljana': 'Central European Time (CET/CEST)',
  'Europe/Sarajevo': 'Central European Time (CET/CEST)',
  'Europe/Skopje': 'Central European Time (CET/CEST)',
  'Europe/Podgorica': 'Central European Time (CET/CEST)',
  'Europe/Tirane': 'Central European Time (CET/CEST)',
  'Europe/Bratislava': 'Central European Time (CET/CEST)',
  'Europe/Luxembourg': 'Central European Time (CET/CEST)',
  'Europe/Monaco': 'Central European Time (CET/CEST)',
  'Europe/San_Marino': 'Central European Time (CET/CEST)',
  'Europe/Vatican': 'Central European Time (CET/CEST)',
  'Europe/Andorra': 'Central European Time (CET/CEST)',
  'Europe/Vaduz': 'Central European Time (CET/CEST)',
  'Europe/Malta': 'Central European Time (CET/CEST)',
  'Europe/Chisinau': 'Eastern European Time (EET/EEST)',
  'Atlantic/Reykjavik': 'Greenwich Mean Time (GMT)',
  
  // Asia
  'Asia/Tokyo': 'Japan Standard Time (JST)',
  'Asia/Seoul': 'Korea Standard Time (KST)',
  'Asia/Shanghai': 'China Standard Time (CST)',
  'Asia/Urumqi': 'China Standard Time (CST)',
  'Asia/Hong_Kong': 'Hong Kong Time (HKT)',
  'Asia/Taipei': 'Taipei Time (CST)',
  'Asia/Singapore': 'Singapore Time (SGT)',
  'Asia/Manila': 'Philippine Time (PHT)',
  'Asia/Bangkok': 'Indochina Time (ICT)',
  'Asia/Ho_Chi_Minh': 'Indochina Time (ICT)',
  'Asia/Jakarta': 'Western Indonesia Time (WIB)',
  'Asia/Makassar': 'Central Indonesia Time (WITA)',
  'Asia/Jayapura': 'Eastern Indonesia Time (WIT)',
  'Asia/Kuala_Lumpur': 'Malaysia Time (MYT)',
  'Asia/Kolkata': 'India Standard Time (IST)',
  'Asia/Dhaka': 'Bangladesh Time (BST)',
  'Asia/Karachi': 'Pakistan Time (PKT)',
  'Asia/Kabul': 'Afghanistan Time (AFT)',
  'Asia/Tashkent': 'Uzbekistan Time (UZT)',
  'Asia/Almaty': 'East Kazakhstan Time (ALMT)',
  'Asia/Aqtobe': 'West Kazakhstan Time (AQTT)',
  'Asia/Bishkek': 'Kyrgyzstan Time (KGT)',
  'Asia/Dushanbe': 'Tajikistan Time (TJT)',
  'Asia/Ashgabat': 'Turkmenistan Time (TMT)',
  'Asia/Yerevan': 'Armenia Time (AMT)',
  'Asia/Baku': 'Azerbaijan Time (AZT)',
  'Asia/Tbilisi': 'Georgia Time (GET)',
  'Asia/Tehran': 'Iran Time (IRST/IRDT)',
  'Asia/Dubai': 'Gulf Standard Time (GST)',
  'Asia/Muscat': 'Gulf Standard Time (GST)',
  'Asia/Kuwait': 'Arabia Standard Time (AST)',
  'Asia/Bahrain': 'Arabia Standard Time (AST)',
  'Asia/Qatar': 'Arabia Standard Time (AST)',
  'Asia/Riyadh': 'Arabia Standard Time (AST)',
  'Asia/Baghdad': 'Arabia Standard Time (AST)',
  'Asia/Amman': 'Eastern European Time (EET/EEST)',
  'Asia/Beirut': 'Eastern European Time (EET/EEST)',
  'Asia/Damascus': 'Eastern European Time (EET/EEST)',
  'Asia/Jerusalem': 'Israel Time (IST/IDT)',
  'Asia/Gaza': 'Eastern European Time (EET/EEST)',
  'Asia/Hebron': 'Eastern European Time (EET/EEST)',
  'Asia/Colombo': 'Sri Lanka Time (IST)',
  'Asia/Kathmandu': 'Nepal Time (NPT)',
  'Asia/Thimphu': 'Bhutan Time (BTT)',
  'Asia/Yangon': 'Myanmar Time (MMT)',
  'Asia/Phnom_Penh': 'Indochina Time (ICT)',
  'Asia/Vientiane': 'Indochina Time (ICT)',
  'Asia/Ulaanbaatar': 'Ulaanbaatar Time (ULAT)',
  'Asia/Pyongyang': 'Pyongyang Time (KST)',
  'Asia/Vladivostok': 'Vladivostok Time (VLAT)',
  'Asia/Yekaterinburg': 'Yekaterinburg Time (YEKT)',
  'Asia/Novosibirsk': 'Novosibirsk Time (NOVT)',
  'Asia/Aden': 'Arabia Standard Time (AST)',
  'Asia/Dili': 'Timor-Leste Time (TLT)',
  'Asia/Nicosia': 'Eastern European Time (EET/EEST)',
  'Asia/Brunei': 'Brunei Time (BNT)',
  
  // Australia & Pacific
  'Australia/Sydney': 'Australian Eastern Time (AEST/AEDT)',
  'Australia/Melbourne': 'Australian Eastern Time (AEST/AEDT)',
  'Australia/Brisbane': 'Australian Eastern Time (AEST)',
  'Australia/Adelaide': 'Australian Central Time (ACST/ACDT)',
  'Australia/Perth': 'Australian Western Time (AWST)',
  'Australia/Darwin': 'Australian Central Time (ACST)',
  'Pacific/Auckland': 'New Zealand Time (NZST/NZDT)',
  'Pacific/Chatham': 'Chatham Time (CHAST/CHADT)',
  'Pacific/Fiji': 'Fiji Time (FJT)',
  'Pacific/Tongatapu': 'Tonga Time (TOT)',
  'Pacific/Apia': 'Samoa Time (SST)',
  'Pacific/Port_Moresby': 'Papua New Guinea Time (PGT)',
  'Pacific/Guadalcanal': 'Solomon Islands Time (SBT)',
  'Pacific/Efate': 'Vanuatu Time (VUT)',
  'Pacific/Pohnpei': 'Pohnpei Time (PONT)',
  'Pacific/Majuro': 'Marshall Islands Time (MHT)',
  'Pacific/Tarawa': 'Gilbert Islands Time (GILT)',
  'Pacific/Nauru': 'Nauru Time (NRT)',
  'Pacific/Palau': 'Palau Time (PWT)',
  'Pacific/Funafuti': 'Tuvalu Time (TVT)',
  
  // Africa
  'Africa/Cairo': 'Eastern European Time (EET)',
  'Africa/Johannesburg': 'South Africa Time (SAST)',
  'Africa/Lagos': 'West Africa Time (WAT)',
  'Africa/Nairobi': 'East Africa Time (EAT)',
  'Africa/Algiers': 'Central European Time (CET)',
  'Africa/Casablanca': 'Western European Time (WET)',
  'Africa/Tunis': 'Central European Time (CET)',
  'Africa/Tripoli': 'Eastern European Time (EET)',
  'Africa/Khartoum': 'Central Africa Time (CAT)',
  'Africa/Addis_Ababa': 'East Africa Time (EAT)',
  'Africa/Dar_es_Salaam': 'East Africa Time (EAT)',
  'Africa/Kampala': 'East Africa Time (EAT)',
  'Africa/Kigali': 'Central Africa Time (CAT)',
  'Africa/Lusaka': 'Central Africa Time (CAT)',
  'Africa/Harare': 'Central Africa Time (CAT)',
  'Africa/Maputo': 'Central Africa Time (CAT)',
  'Africa/Windhoek': 'Central Africa Time (CAT)',
  'Africa/Gaborone': 'Central Africa Time (CAT)',
  'Africa/Maseru': 'South Africa Time (SAST)',
  'Africa/Mbabane': 'South Africa Time (SAST)',
  'Africa/Blantyre': 'Central Africa Time (CAT)',
  'Africa/Bujumbura': 'Central Africa Time (CAT)',
  'Africa/Juba': 'Central Africa Time (CAT)',
  'Africa/Mogadishu': 'East Africa Time (EAT)',
  'Africa/Djibouti': 'East Africa Time (EAT)',
  'Africa/Asmara': 'East Africa Time (EAT)',
  'Africa/Accra': 'Greenwich Mean Time (GMT)',
  'Africa/Abidjan': 'Greenwich Mean Time (GMT)',
  'Africa/Dakar': 'Greenwich Mean Time (GMT)',
  'Africa/Bamako': 'Greenwich Mean Time (GMT)',
  'Africa/Conakry': 'Greenwich Mean Time (GMT)',
  'Africa/Bissau': 'Greenwich Mean Time (GMT)',
  'Africa/Monrovia': 'Greenwich Mean Time (GMT)',
  'Africa/Freetown': 'Greenwich Mean Time (GMT)',
  'Africa/Nouakchott': 'Greenwich Mean Time (GMT)',
  'Africa/Banjul': 'Greenwich Mean Time (GMT)',
  'Africa/Lome': 'Greenwich Mean Time (GMT)',
  'Africa/Ouagadougou': 'Greenwich Mean Time (GMT)',
  'Africa/Niamey': 'West Africa Time (WAT)',
  'Africa/Porto-Novo': 'West Africa Time (WAT)',
  'Africa/Douala': 'West Africa Time (WAT)',
  'Africa/Libreville': 'West Africa Time (WAT)',
  'Africa/Malabo': 'West Africa Time (WAT)',
  'Africa/Bangui': 'West Africa Time (WAT)',
  'Africa/Brazzaville': 'West Africa Time (WAT)',
  'Africa/Kinshasa': 'West Africa Time (WAT)',
  'Africa/Luanda': 'West Africa Time (WAT)',
  'Africa/Ndjamena': 'West Africa Time (WAT)',
  'Africa/Sao_Tome': 'Greenwich Mean Time (GMT)',
  
  // Atlantic & Indian Ocean
  'Atlantic/Cape_Verde': 'Cape Verde Time (CVT)',
  'Indian/Mauritius': 'Mauritius Time (MUT)',
  'Indian/Mahe': 'Seychelles Time (SCT)',
  'Indian/Maldives': 'Maldives Time (MVT)',
  'Indian/Comoro': 'East Africa Time (EAT)',
  'Indian/Antananarivo': 'East Africa Time (EAT)',
  
  // UTC
  'UTC': 'Coordinated Universal Time (UTC)',
};

// Custom Picker Component with Search - Moved outside to prevent re-creation
const CustomPicker = React.memo(({ 
  visible, 
  onClose, 
  title, 
  options, 
  selectedValue, 
  onSelect,
  searchable = false,
  searchQuery = '',
  onSearchChange = () => {}
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: { label: string; value: string }[];
  selectedValue: string;
  onSelect: (value: string) => void;
  searchable?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}) => {
  // Filter options based on search query - search from the start of country name (after emoji)
  const filteredOptions = React.useMemo(() => {
    if (!searchable || !searchQuery || searchQuery.trim() === '') {
      return options;
    }
    const query = searchQuery.toLowerCase();
    return options.filter(option => {
      // Remove emoji and get country name
      const countryName = option.label.replace(/^[\u{1F1E6}-\u{1F1FF}]{2}\s*/u, '').toLowerCase();
      // Check if country name starts with the query
      return countryName.startsWith(query);
    });
  }, [searchable, searchQuery, options]);

  const renderItem = React.useCallback(({ item: option }: { item: { label: string; value: string } }) => (
    <TouchableOpacity
      style={[
        styles.pickerModalOption,
        selectedValue === option.value && styles.pickerModalOptionSelected
      ]}
      onPress={() => {
        playTabSound();
        onSelect(option.value);
        if (searchable) {
          onSearchChange(''); // Clear search on select
        }
        onClose();
      }}
    >
      <Text style={[
        styles.pickerModalOptionText,
        selectedValue === option.value && styles.pickerModalOptionTextSelected
      ]}>
        {option.label}
      </Text>
      {selectedValue === option.value && (
        <Text style={styles.pickerModalCheckmark}>✓</Text>
      )}
    </TouchableOpacity>
  ), [selectedValue, searchable, onSelect, onSearchChange, onClose]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.pickerModalOverlay}>
        <View style={styles.pickerModalContainer}>
          <View style={styles.pickerModalHeader}>
            <Text style={styles.pickerModalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.pickerModalCloseButton}>
              <Text style={styles.pickerModalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {/* Search Input */}
          {searchable && (
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Type country name..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={onSearchChange}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus={true}
                returnKeyType="done"
              />
            </View>
          )}
          
          <FlatList
            key="country-list"
            data={filteredOptions}
            keyExtractor={(item) => item.value}
            style={styles.pickerModalScrollView}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={false}
            maxToRenderPerBatch={20}
            updateCellsBatchingPeriod={100}
            initialNumToRender={20}
            windowSize={5}
            getItemLayout={(data, index) => ({
              length: SCREEN_HEIGHT * 0.02 + SCREEN_WIDTH * 0.1, // Approximate item height
              offset: (SCREEN_HEIGHT * 0.02 + SCREEN_WIDTH * 0.1) * index,
              index,
            })}
            ListEmptyComponent={
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>
                  No countries found starting with "{searchQuery}"
                </Text>
              </View>
            }
            renderItem={renderItem}
          />
        </View>
      </View>
    </Modal>
  );
});

// Picker data arrays
const STUDENT_LEVELS = [
  { label: '👨‍🎓 High School Student', value: 'highschool' },
  { label: '👩‍🎓 University Student', value: 'university' },
  { label: '👨‍🎓 Graduate Student', value: 'graduate' },
  { label: '📚 Lifelong Learner', value: 'learner' },
];

// Comprehensive country list - alphabetically sorted
const COUNTRIES = [
  { label: '🇦🇫 Afghanistan', value: 'AF' },
  { label: '🇦🇱 Albania', value: 'AL' },
  { label: '🇩🇿 Algeria', value: 'DZ' },
  { label: '🇦🇩 Andorra', value: 'AD' },
  { label: '🇦🇴 Angola', value: 'AO' },
  { label: '🇦🇬 Antigua and Barbuda', value: 'AG' },
  { label: '🇦🇷 Argentina', value: 'AR' },
  { label: '🇦🇲 Armenia', value: 'AM' },
  { label: '🇦🇺 Australia', value: 'AU' },
  { label: '🇦🇹 Austria', value: 'AT' },
  { label: '🇦🇿 Azerbaijan', value: 'AZ' },
  { label: '🇧🇸 Bahamas', value: 'BS' },
  { label: '🇧🇭 Bahrain', value: 'BH' },
  { label: '🇧🇩 Bangladesh', value: 'BD' },
  { label: '🇧🇧 Barbados', value: 'BB' },
  { label: '🇧🇾 Belarus', value: 'BY' },
  { label: '🇧🇪 Belgium', value: 'BE' },
  { label: '🇧🇿 Belize', value: 'BZ' },
  { label: '🇧🇯 Benin', value: 'BJ' },
  { label: '🇧🇹 Bhutan', value: 'BT' },
  { label: '🇧🇴 Bolivia', value: 'BO' },
  { label: '🇧🇦 Bosnia and Herzegovina', value: 'BA' },
  { label: '🇧🇼 Botswana', value: 'BW' },
  { label: '🇧🇷 Brazil', value: 'BR' },
  { label: '🇧🇳 Brunei', value: 'BN' },
  { label: '🇧🇬 Bulgaria', value: 'BG' },
  { label: '🇧🇫 Burkina Faso', value: 'BF' },
  { label: '🇧🇮 Burundi', value: 'BI' },
  { label: '🇰🇭 Cambodia', value: 'KH' },
  { label: '🇨🇲 Cameroon', value: 'CM' },
  { label: '🇨🇦 Canada', value: 'CA' },
  { label: '🇨🇻 Cape Verde', value: 'CV' },
  { label: '🇨🇫 Central African Republic', value: 'CF' },
  { label: '🇹🇩 Chad', value: 'TD' },
  { label: '🇨🇱 Chile', value: 'CL' },
  { label: '🇨🇳 China', value: 'CN' },
  { label: '🇨🇴 Colombia', value: 'CO' },
  { label: '🇰🇲 Comoros', value: 'KM' },
  { label: '🇨🇬 Congo', value: 'CG' },
  { label: '🇨🇷 Costa Rica', value: 'CR' },
  { label: '🇭🇷 Croatia', value: 'HR' },
  { label: '🇨🇺 Cuba', value: 'CU' },
  { label: '🇨🇾 Cyprus', value: 'CY' },
  { label: '🇨🇿 Czech Republic', value: 'CZ' },
  { label: '🇩🇰 Denmark', value: 'DK' },
  { label: '🇩🇯 Djibouti', value: 'DJ' },
  { label: '🇩🇲 Dominica', value: 'DM' },
  { label: '🇩🇴 Dominican Republic', value: 'DO' },
  { label: '🇪🇨 Ecuador', value: 'EC' },
  { label: '🇪🇬 Egypt', value: 'EG' },
  { label: '🇸🇻 El Salvador', value: 'SV' },
  { label: '🇬🇶 Equatorial Guinea', value: 'GQ' },
  { label: '🇪🇷 Eritrea', value: 'ER' },
  { label: '🇪🇪 Estonia', value: 'EE' },
  { label: '🇪🇹 Ethiopia', value: 'ET' },
  { label: '🇫🇯 Fiji', value: 'FJ' },
  { label: '🇫🇮 Finland', value: 'FI' },
  { label: '🇫🇷 France', value: 'FR' },
  { label: '🇬🇦 Gabon', value: 'GA' },
  { label: '🇬🇲 Gambia', value: 'GM' },
  { label: '🇬🇪 Georgia', value: 'GE' },
  { label: '🇩🇪 Germany', value: 'DE' },
  { label: '🇬🇭 Ghana', value: 'GH' },
  { label: '🇬🇷 Greece', value: 'GR' },
  { label: '🇬🇩 Grenada', value: 'GD' },
  { label: '🇬🇹 Guatemala', value: 'GT' },
  { label: '🇬🇳 Guinea', value: 'GN' },
  { label: '🇬🇼 Guinea-Bissau', value: 'GW' },
  { label: '🇬🇾 Guyana', value: 'GY' },
  { label: '🇭🇹 Haiti', value: 'HT' },
  { label: '🇭🇳 Honduras', value: 'HN' },
  { label: '🇭🇺 Hungary', value: 'HU' },
  { label: '🇮🇸 Iceland', value: 'IS' },
  { label: '🇮🇳 India', value: 'IN' },
  { label: '🇮🇩 Indonesia', value: 'ID' },
  { label: '🇮🇷 Iran', value: 'IR' },
  { label: '🇮🇶 Iraq', value: 'IQ' },
  { label: '🇮🇪 Ireland', value: 'IE' },
  { label: '🇮🇱 Israel', value: 'IL' },
  { label: '🇮🇹 Italy', value: 'IT' },
  { label: '🇯🇲 Jamaica', value: 'JM' },
  { label: '🇯🇵 Japan', value: 'JP' },
  { label: '🇯🇴 Jordan', value: 'JO' },
  { label: '🇰🇿 Kazakhstan', value: 'KZ' },
  { label: '🇰🇪 Kenya', value: 'KE' },
  { label: '🇰🇮 Kiribati', value: 'KI' },
  { label: '🇰🇼 Kuwait', value: 'KW' },
  { label: '🇰🇬 Kyrgyzstan', value: 'KG' },
  { label: '🇱🇦 Laos', value: 'LA' },
  { label: '🇱🇻 Latvia', value: 'LV' },
  { label: '🇱🇧 Lebanon', value: 'LB' },
  { label: '🇱🇸 Lesotho', value: 'LS' },
  { label: '🇱🇷 Liberia', value: 'LR' },
  { label: '🇱🇾 Libya', value: 'LY' },
  { label: '🇱🇮 Liechtenstein', value: 'LI' },
  { label: '🇱🇹 Lithuania', value: 'LT' },
  { label: '🇱🇺 Luxembourg', value: 'LU' },
  { label: '🇲🇬 Madagascar', value: 'MG' },
  { label: '🇲🇼 Malawi', value: 'MW' },
  { label: '🇲🇾 Malaysia', value: 'MY' },
  { label: '🇲🇻 Maldives', value: 'MV' },
  { label: '🇲🇱 Mali', value: 'ML' },
  { label: '🇲🇹 Malta', value: 'MT' },
  { label: '🇲🇭 Marshall Islands', value: 'MH' },
  { label: '🇲🇷 Mauritania', value: 'MR' },
  { label: '🇲🇺 Mauritius', value: 'MU' },
  { label: '🇲🇽 Mexico', value: 'MX' },
  { label: '🇫🇲 Micronesia', value: 'FM' },
  { label: '🇲🇩 Moldova', value: 'MD' },
  { label: '🇲🇨 Monaco', value: 'MC' },
  { label: '🇲🇳 Mongolia', value: 'MN' },
  { label: '🇲🇪 Montenegro', value: 'ME' },
  { label: '🇲🇦 Morocco', value: 'MA' },
  { label: '🇲🇿 Mozambique', value: 'MZ' },
  { label: '🇲🇲 Myanmar', value: 'MM' },
  { label: '🇳🇦 Namibia', value: 'NA' },
  { label: '🇳🇷 Nauru', value: 'NR' },
  { label: '🇳🇵 Nepal', value: 'NP' },
  { label: '🇳🇱 Netherlands', value: 'NL' },
  { label: '🇳🇿 New Zealand', value: 'NZ' },
  { label: '🇳🇮 Nicaragua', value: 'NI' },
  { label: '🇳🇪 Niger', value: 'NE' },
  { label: '🇳🇬 Nigeria', value: 'NG' },
  { label: '🇰🇵 North Korea', value: 'KP' },
  { label: '🇲🇰 North Macedonia', value: 'MK' },
  { label: '🇳🇴 Norway', value: 'NO' },
  { label: '🇴🇲 Oman', value: 'OM' },
  { label: '🇵🇰 Pakistan', value: 'PK' },
  { label: '🇵🇼 Palau', value: 'PW' },
  { label: '🇵🇸 Palestine', value: 'PS' },
  { label: '🇵🇦 Panama', value: 'PA' },
  { label: '🇵🇬 Papua New Guinea', value: 'PG' },
  { label: '🇵🇾 Paraguay', value: 'PY' },
  { label: '🇵🇪 Peru', value: 'PE' },
  { label: '🇵🇭 Philippines', value: 'PH' },
  { label: '🇵🇱 Poland', value: 'PL' },
  { label: '🇵🇹 Portugal', value: 'PT' },
  { label: '🇶🇦 Qatar', value: 'QA' },
  { label: '🇷🇴 Romania', value: 'RO' },
  { label: '🇷🇺 Russia', value: 'RU' },
  { label: '🇷🇼 Rwanda', value: 'RW' },
  { label: '🇰🇳 Saint Kitts and Nevis', value: 'KN' },
  { label: '🇱🇨 Saint Lucia', value: 'LC' },
  { label: '🇻🇨 Saint Vincent and the Grenadines', value: 'VC' },
  { label: '🇼🇸 Samoa', value: 'WS' },
  { label: '🇸🇲 San Marino', value: 'SM' },
  { label: '🇸🇹 Sao Tome and Principe', value: 'ST' },
  { label: '🇸🇦 Saudi Arabia', value: 'SA' },
  { label: '🇸🇳 Senegal', value: 'SN' },
  { label: '🇷🇸 Serbia', value: 'RS' },
  { label: '🇸🇨 Seychelles', value: 'SC' },
  { label: '🇸🇱 Sierra Leone', value: 'SL' },
  { label: '🇸🇬 Singapore', value: 'SG' },
  { label: '🇸🇰 Slovakia', value: 'SK' },
  { label: '🇸🇮 Slovenia', value: 'SI' },
  { label: '🇸🇧 Solomon Islands', value: 'SB' },
  { label: '🇸🇴 Somalia', value: 'SO' },
  { label: '🇿🇦 South Africa', value: 'ZA' },
  { label: '🇰🇷 South Korea', value: 'KR' },
  { label: '🇸🇸 South Sudan', value: 'SS' },
  { label: '🇪🇸 Spain', value: 'ES' },
  { label: '🇱🇰 Sri Lanka', value: 'LK' },
  { label: '🇸🇩 Sudan', value: 'SD' },
  { label: '🇸🇷 Suriname', value: 'SR' },
  { label: '🇸🇪 Sweden', value: 'SE' },
  { label: '🇨🇭 Switzerland', value: 'CH' },
  { label: '🇸🇾 Syria', value: 'SY' },
  { label: '🇹🇼 Taiwan', value: 'TW' },
  { label: '🇹🇯 Tajikistan', value: 'TJ' },
  { label: '🇹🇿 Tanzania', value: 'TZ' },
  { label: '🇹🇭 Thailand', value: 'TH' },
  { label: '🇹🇱 Timor-Leste', value: 'TL' },
  { label: '🇹🇬 Togo', value: 'TG' },
  { label: '🇹🇴 Tonga', value: 'TO' },
  { label: '🇹🇹 Trinidad and Tobago', value: 'TT' },
  { label: '🇹🇳 Tunisia', value: 'TN' },
  { label: '🇹🇷 Turkey', value: 'TR' },
  { label: '🇹🇲 Turkmenistan', value: 'TM' },
  { label: '🇹🇻 Tuvalu', value: 'TV' },
  { label: '🇺🇬 Uganda', value: 'UG' },
  { label: '🇺🇦 Ukraine', value: 'UA' },
  { label: '🇦🇪 United Arab Emirates', value: 'AE' },
  { label: '🇬🇧 United Kingdom', value: 'UK' },
  { label: '🇺🇸 United States', value: 'US' },
  { label: '🇺🇾 Uruguay', value: 'UY' },
  { label: '🇺🇿 Uzbekistan', value: 'UZ' },
  { label: '🇻🇺 Vanuatu', value: 'VU' },
  { label: '🇻🇦 Vatican City', value: 'VA' },
  { label: '🇻🇪 Venezuela', value: 'VE' },
  { label: '🇻🇳 Vietnam', value: 'VN' },
  { label: '🇾🇪 Yemen', value: 'YE' },
  { label: '🇿🇲 Zambia', value: 'ZM' },
  { label: '🇿🇼 Zimbabwe', value: 'ZW' },
  { label: '🌍 Other', value: 'OTHER' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const setProfile = useQuillbyStore((state) => state.setProfile);
  
  const [userName, setUserName] = useState('');
  const [studentLevel, setStudentLevel] = useState('');
  const [country, setCountry] = useState('');
  const [timezone, setTimezone] = useState('');

  // Custom picker modal states
  const [showStudentLevelPicker, setShowStudentLevelPicker] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showTimezonePicker, setShowTimezonePicker] = useState(false);
  
  // Search state for country picker
  const [countrySearchQuery, setCountrySearchQuery] = useState('');

  // Memoize callbacks to prevent re-renders
  const handleCountrySearchChange = React.useCallback((query: string) => {
    setCountrySearchQuery(query);
  }, []);

  const handleCountrySelect = React.useCallback((value: string) => {
    setCountry(value);
  }, []);

  const handleCloseCountryPicker = React.useCallback(() => {
    setShowCountryPicker(false);
    setCountrySearchQuery('');
  }, []);

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    'Caviche': require('../../assets/fonts/Caviche-Regular.ttf'),
    ChakraPetch_400Regular,
    ChakraPetch_600SemiBold,
  });

  // Handle back button - navigate to previous onboarding screen without alert
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Navigate back to name-buddy screen
      router.back();
      return true; // Prevent default behavior
    });

    return () => backHandler.remove();
  }, [router]);

  // Show loading while fonts load
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9800" />
      </View>
    );
  }

  // Auto-fill timezone when country changes
  useEffect(() => {
    if (country && COUNTRY_TIMEZONES[country]) {
      const timezones = COUNTRY_TIMEZONES[country];
      if (timezones.length > 0) {
        setTimezone(timezones[0]); // Auto-select first timezone
        console.log(`[Profile] Auto-selected timezone: ${timezones[0]} for ${country}`);
      }
    }
  }, [country]);

  const detectLocation = async () => {
    try {
      console.log('[Profile] User clicked detect location button');
      
      // 1. Show explanation and ask for user confirmation first
      const userConfirmed = await new Promise<boolean>((resolve) => {
        Alert.alert(
          '📍 Detect Your Location',
          'Quillby needs access to your location to automatically detect your country and timezone. This helps set up your study schedule correctly.\n\nYour location is only used once for setup and is not stored or tracked.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => resolve(false)
            },
            {
              text: 'Allow Access',
              onPress: () => resolve(true)
            }
          ]
        );
      });
      
      if (!userConfirmed) {
        console.log('[Profile] User canceled location permission');
        return;
      }
      
      console.log('[Profile] User agreed, requesting system permission...');
      
      // 2. Request system location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('[Profile] Location permission denied by system');
        Alert.alert(
          'Permission Denied',
          'Location access is needed to detect your country. Please select it manually from the list.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      console.log('[Profile] Location permission granted, getting location...');
      
      // 3. Get current location (low accuracy = faster, less battery)
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Lowest, // Fastest, most battery-friendly
      });
      
      console.log('[Profile] Got coordinates:', location.coords.latitude, location.coords.longitude);
      
      // 4. Convert coordinates to country
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      if (geocode.length === 0) {
        throw new Error('No geocode results');
      }
      
      const countryCode = geocode[0].isoCountryCode;
      const countryName = geocode[0].country;
      const region = geocode[0].region;
      
      console.log('[Profile] Geocode result:', { countryCode, countryName, region });
      
      // 5. Map ISO country code to our country codes
      const countryCodeMap: Record<string, string> = {
        'US': 'US',
        'GB': 'UK', // ISO code GB maps to our UK
        'CA': 'CA',
        'AU': 'AU',
        'IN': 'IN',
        'DE': 'DE',
        'FR': 'FR',
        'JP': 'JP',
        'KR': 'KR',
        'BR': 'BR',
        'MX': 'MX',
        'ES': 'ES',
        'IT': 'IT',
        'NL': 'NL',
        'SE': 'SE',
      };
      
      // 6. Check if country is in our list
      if (countryCode && countryCodeMap[countryCode]) {
        const mappedCountryCode = countryCodeMap[countryCode];
        setCountry(mappedCountryCode);
        
        // Try to match timezone
        const timezones = COUNTRY_TIMEZONES[mappedCountryCode];
        if (timezones && timezones.length > 0) {
          // Try to get device timezone and match it
          const calendars = Localization.getCalendars();
          const deviceTimezone = calendars[0]?.timeZone;
          
          if (deviceTimezone && timezones.includes(deviceTimezone)) {
            setTimezone(deviceTimezone);
            console.log('[Profile] Matched device timezone:', deviceTimezone);
          } else {
            setTimezone(timezones[0]); // Use first timezone as default
            console.log('[Profile] Using default timezone:', timezones[0]);
          }
        }
        
        Alert.alert(
          '✅ Location Detected!',
          `Detected: ${countryName}${region ? `, ${region}` : ''}\n\nYou can adjust the timezone if needed.`,
          [{ text: 'Great!' }]
        );
        
      } else {
        console.log('[Profile] Country not in our list:', countryCode, countryName);
        Alert.alert(
          'Country Not in List',
          `Detected: ${countryName || 'Unknown'}. Please select your country manually from the list.`,
          [{ text: 'OK' }]
        );
      }
      
    } catch (error) {
      console.error('[Profile] Location detection failed:', error);
      
      Alert.alert(
        'Detection Failed',
        'Could not detect your location. Please select country and timezone manually.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleNext = () => {
    if (isFormValid) {
      playUISubmitSound();
      // Save to store
      setProfile(userName, studentLevel, country, timezone);
      // Navigate to habit setup screen
      router.push('/onboarding/habit-setup');
    }
  };

  const isFormValid = studentLevel && country && timezone; // All three required

  // Get timezone options based on selected country
  const getTimezoneOptions = () => {
    if (!country || !COUNTRY_TIMEZONES[country]) {
      return [];
    }
    return COUNTRY_TIMEZONES[country].map(tz => ({
      label: TIMEZONE_NAMES[tz] || tz,
      value: tz,
    }));
  };

  // Helper functions to get display labels
  const getStudentLevelLabel = () => {
    const level = STUDENT_LEVELS.find(l => l.value === studentLevel);
    return level ? level.label : 'Select your level...';
  };

  const getCountryLabel = () => {
    const countryData = COUNTRIES.find(c => c.value === country);
    return countryData ? countryData.label : 'Select your country...';
  };

  const getTimezoneLabel = () => {
    const timezoneOptions = getTimezoneOptions();
    const timezoneData = timezoneOptions.find(t => t.value === timezone);
    return timezoneData ? timezoneData.label : (country ? 'Select timezone...' : 'Select country first');
  };

  return (
    <ImageBackground
      source={require('../../assets/backgrounds/theme.png')}
      style={styles.background}
      resizeMode="cover"
      defaultSource={require('../../assets/backgrounds/theme.png')}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.title}>Tell Us About{'\n'}Yourself</Text>
        <Text style={styles.subtitle}>Help Quillby understand your world</Text>

        {/* Form Container */}
        <View style={styles.formContainer}>
          
          {/* 1. Name Input (Optional) */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>What should we call you?</Text>
            <Text style={styles.inputHint}>(Optional - for personalized messages)</Text>
            <TextInput
              style={styles.textInput}
              value={userName}
              onChangeText={setUserName}
              placeholder="Your name"
              placeholderTextColor="#999"
              maxLength={30}
            />
          </View>

          {/* 2. Student Level Picker */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>You are a...</Text>
            <TouchableOpacity 
              style={styles.customPickerButton}
              onPress={() => {
                playTabSound();
                setShowStudentLevelPicker(true);
              }}
            >
              <Text style={[
                styles.customPickerButtonText,
                !studentLevel && styles.customPickerButtonTextPlaceholder
              ]}>
                {getStudentLevelLabel()}
              </Text>
              <Text style={styles.customPickerButtonArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* 3. Country Picker (Simplified) */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Your country</Text>
            <Text style={styles.inputHint}>(For academic calendars & holidays)</Text>
            <TouchableOpacity 
              style={styles.customPickerButton}
              onPress={() => {
                playTabSound();
                setCountrySearchQuery(''); // Clear search before opening
                setShowCountryPicker(true);
              }}
            >
              <Text style={[
                styles.customPickerButtonText,
                !country && styles.customPickerButtonTextPlaceholder
              ]}>
                {getCountryLabel()}
              </Text>
              <Text style={styles.customPickerButtonArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* 4. Timezone Picker (Auto-filled based on country) */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Your timezone</Text>
            <Text style={styles.inputHint}>
              {country 
                ? '(Auto-selected, but you can change it)' 
                : '(Select country first)'}
            </Text>
            <TouchableOpacity 
              style={[
                styles.customPickerButton,
                !country && styles.customPickerButtonDisabled
              ]}
              onPress={() => {
                if (country) {
                  playTabSound();
                  setShowTimezonePicker(true);
                }
              }}
              disabled={!country}
            >
              <Text style={[
                styles.customPickerButtonText,
                !timezone && styles.customPickerButtonTextPlaceholder,
                !country && styles.customPickerButtonTextDisabled
              ]}>
                {getTimezoneLabel()}
              </Text>
              <Text style={[
                styles.customPickerButtonArrow,
                !country && styles.customPickerButtonArrowDisabled
              ]}>▼</Text>
            </TouchableOpacity>
            
            {/* Auto-detect button (only show if no country selected) */}
            {!country && (
              <TouchableOpacity
                style={styles.detectButton}
                onPress={() => {
                  playTabSound();
                  detectLocation();
                }}
              >
                <Text style={styles.detectButtonText}>
                  📍 Detect my location automatically
                </Text>
              </TouchableOpacity>
            )}
          </View>



        </View>

        {/* Next Button */}
        <TouchableOpacity
          style={[styles.nextButton, !isFormValid && styles.nextButtonDisabled]}
          disabled={!isFormValid}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {isFormValid ? 'Complete Setup →' : 'Fill all required fields'}
          </Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Custom Picker Modals */}
      <CustomPicker
        visible={showStudentLevelPicker}
        onClose={() => setShowStudentLevelPicker(false)}
        title="Select Your Level"
        options={STUDENT_LEVELS}
        selectedValue={studentLevel}
        onSelect={setStudentLevel}
      />

      <CustomPicker
        visible={showCountryPicker}
        onClose={handleCloseCountryPicker}
        title="Select Your Country"
        options={COUNTRIES}
        selectedValue={country}
        onSelect={handleCountrySelect}
        searchable={true}
        searchQuery={countrySearchQuery}
        onSearchChange={handleCountrySearchChange}
      />

      <CustomPicker
        visible={showTimezonePicker}
        onClose={() => setShowTimezonePicker(false)}
        title="Select Your Timezone"
        options={getTimezoneOptions()}
        selectedValue={timezone}
        onSelect={setTimezone}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    paddingTop: SCREEN_HEIGHT * 0.08,
    paddingBottom: SCREEN_HEIGHT * 0.05,
  },
  // RESPONSIVE: Title
  title: {
    fontFamily: 'Caviche',
    fontSize: SCREEN_WIDTH * 0.12,
    lineHeight: SCREEN_WIDTH * 0.13,
    color: '#63582A',
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0,
  },
  subtitle: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#666',
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  // Form Container
  formContainer: {
    gap: SCREEN_HEIGHT * 0.025,
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  // Input Cards
  inputCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: SCREEN_WIDTH * 0.05,
    borderWidth: 1,
    borderColor: '#EEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputLabel: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: SCREEN_WIDTH * 0.045,
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.005,
  },
  inputHint: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: SCREEN_WIDTH * 0.03,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  textInput: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#333',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: SCREEN_WIDTH * 0.03,
    backgroundColor: '#FFF',
  },
  // Custom Picker Button Styles
  customPickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    backgroundColor: '#FFF',
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    paddingVertical: SCREEN_HEIGHT * 0.018,
    minHeight: 55,
  },
  customPickerButtonDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#CCC',
  },
  customPickerButtonText: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: SCREEN_WIDTH * 0.045,
    color: '#333',
    flex: 1,
  },
  customPickerButtonTextPlaceholder: {
    color: '#999',
  },
  customPickerButtonTextDisabled: {
    color: '#CCC',
  },
  customPickerButtonArrow: {
    fontSize: SCREEN_WIDTH * 0.05,
    color: '#666',
    marginLeft: SCREEN_WIDTH * 0.02,
  },
  customPickerButtonArrowDisabled: {
    color: '#CCC',
  },
  // Custom Picker Modal Styles
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerModalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: SCREEN_HEIGHT * 0.7, // Fixed height instead of maxHeight
  },
  pickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SCREEN_WIDTH * 0.05,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  pickerModalTitle: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: SCREEN_WIDTH * 0.045,
    color: '#333',
    flex: 1,
  },
  pickerModalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerModalCloseText: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#666',
    fontWeight: '600',
  },
  pickerModalScrollView: {
    flex: 1, // Take remaining space
  },
  searchContainer: {
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    paddingVertical: SCREEN_HEIGHT * 0.015,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  searchInput: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#333',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: SCREEN_WIDTH * 0.03,
    backgroundColor: '#F5F5F5',
  },
  noResultsContainer: {
    padding: SCREEN_WIDTH * 0.1,
    alignItems: 'center',
  },
  noResultsText: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#999',
    textAlign: 'center',
  },
  pickerModalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.02,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pickerModalOptionSelected: {
    backgroundColor: '#E8F5E9',
  },
  pickerModalOptionText: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#333',
    flex: 1,
  },
  pickerModalOptionTextSelected: {
    fontFamily: 'ChakraPetch_600SemiBold',
    color: '#2E7D32',
  },
  pickerModalCheckmark: {
    fontSize: SCREEN_WIDTH * 0.045,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  // Next Button
  nextButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: SCREEN_HEIGHT * 0.02,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: SCREEN_HEIGHT * 0.02,
  },
  nextButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  nextButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    color: '#FFF',
    fontSize: SCREEN_WIDTH * 0.045,
  },
  // Detect Button
  detectButton: {
    marginTop: SCREEN_HEIGHT * 0.015,
    backgroundColor: '#FF9800',
    paddingVertical: SCREEN_HEIGHT * 0.015,
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    borderRadius: 10,
    alignItems: 'center',
  },
  detectButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    color: '#FFF',
    fontSize: SCREEN_WIDTH * 0.035,
  },
  // Weight Goal Styles
  weightGoalContainer: {
    flexDirection: 'row',
    gap: SCREEN_WIDTH * 0.02,
  },
  goalButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: SCREEN_WIDTH * 0.03,
    alignItems: 'center',
    position: 'relative',
  },
  goalButtonContent: {
    alignItems: 'center',
  },
  goalButtonSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  goalButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  goalButtonTextSelected: {
    color: '#2E7D32',
  },
  goalSubtext: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: SCREEN_WIDTH * 0.025,
    color: '#999',
    textAlign: 'center',
  },
  goalSubtextSelected: {
    color: '#4CAF50',
  },
  checkmark: {
    position: 'absolute',
    top: SCREEN_WIDTH * 0.01,
    right: SCREEN_WIDTH * 0.01,
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});
