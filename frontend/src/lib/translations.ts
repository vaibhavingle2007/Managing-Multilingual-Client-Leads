/**
 * Translations — 8-language support
 *
 * Each key maps to a translation dictionary used across the submit form.
 * Browser auto-detection maps navigator.language prefix to a SupportedLang.
 */

export const SUPPORTED_LANGUAGES = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
    { code: "es", label: "Español", flag: "🇪🇸" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "de", label: "Deutsch", flag: "🇩🇪" },
    { code: "ar", label: "العربية", flag: "🇸🇦" },
    { code: "pt", label: "Português", flag: "🇧🇷" },
    { code: "zh", label: "中文", flag: "🇨🇳" },
] as const;

export type SupportedLang = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export interface TranslationStrings {
    pageTitle: string;
    pageSubtitle: string;
    labelName: string;
    labelEmail: string;
    labelPhone: string;
    labelMessage: string;
    labelLanguage: string;
    placeholderName: string;
    placeholderEmail: string;
    placeholderPhone: string;
    placeholderMessage: string;
    submitButton: string;
    submitting: string;
    successMessage: string;
    errorMessage: string;
    // Validation
    required: string;
    nameTooShort: string;
    invalidEmail: string;
    invalidPhone: string;
    messageTooShort: string;
}

const translations: Record<SupportedLang, TranslationStrings> = {
    en: {
        pageTitle: "Submit a Lead",
        pageSubtitle: "Fill in the details below. All fields are required.",
        labelName: "Full Name",
        labelEmail: "Email Address",
        labelPhone: "Phone Number",
        labelMessage: "Message",
        labelLanguage: "Language",
        placeholderName: "Jane Doe",
        placeholderEmail: "jane@example.com",
        placeholderPhone: "+1 555 123 4567",
        placeholderMessage: "Tell us about your requirements…",
        submitButton: "Submit Lead",
        submitting: "Submitting…",
        successMessage: "Lead submitted successfully!",
        errorMessage: "Something went wrong. Please try again.",
        required: "This field is required",
        nameTooShort: "Name must be at least 2 characters",
        invalidEmail: "Enter a valid email address",
        invalidPhone: "Enter a valid phone number",
        messageTooShort: "Message must be at least 10 characters",
    },
    hi: {
        pageTitle: "लीड सबमिट करें",
        pageSubtitle: "नीचे विवरण भरें। सभी फ़ील्ड आवश्यक हैं।",
        labelName: "पूरा नाम",
        labelEmail: "ईमेल पता",
        labelPhone: "फ़ोन नंबर",
        labelMessage: "संदेश",
        labelLanguage: "भाषा",
        placeholderName: "राहुल शर्मा",
        placeholderEmail: "rahul@example.com",
        placeholderPhone: "+91 98765 43210",
        placeholderMessage: "अपनी आवश्यकताओं के बारे में बताएं…",
        submitButton: "लीड सबमिट करें",
        submitting: "सबमिट हो रहा है…",
        successMessage: "लीड सफलतापूर्वक सबमिट हो गई!",
        errorMessage: "कुछ गलत हो गया। कृपया पुनः प्रयास करें।",
        required: "यह फ़ील्ड आवश्यक है",
        nameTooShort: "नाम कम से कम 2 अक्षर का होना चाहिए",
        invalidEmail: "एक मान्य ईमेल पता दर्ज करें",
        invalidPhone: "एक मान्य फ़ोन नंबर दर्ज करें",
        messageTooShort: "संदेश कम से कम 10 अक्षर का होना चाहिए",
    },
    es: {
        pageTitle: "Enviar un Lead",
        pageSubtitle: "Complete los detalles a continuación. Todos los campos son obligatorios.",
        labelName: "Nombre Completo",
        labelEmail: "Correo Electrónico",
        labelPhone: "Número de Teléfono",
        labelMessage: "Mensaje",
        labelLanguage: "Idioma",
        placeholderName: "María García",
        placeholderEmail: "maria@ejemplo.com",
        placeholderPhone: "+34 612 345 678",
        placeholderMessage: "Cuéntenos sobre sus necesidades…",
        submitButton: "Enviar Lead",
        submitting: "Enviando…",
        successMessage: "¡Lead enviado con éxito!",
        errorMessage: "Algo salió mal. Inténtelo de nuevo.",
        required: "Este campo es obligatorio",
        nameTooShort: "El nombre debe tener al menos 2 caracteres",
        invalidEmail: "Ingrese un correo electrónico válido",
        invalidPhone: "Ingrese un número de teléfono válido",
        messageTooShort: "El mensaje debe tener al menos 10 caracteres",
    },
    fr: {
        pageTitle: "Soumettre un Lead",
        pageSubtitle: "Remplissez les détails ci-dessous. Tous les champs sont obligatoires.",
        labelName: "Nom Complet",
        labelEmail: "Adresse Email",
        labelPhone: "Numéro de Téléphone",
        labelMessage: "Message",
        labelLanguage: "Langue",
        placeholderName: "Jean Dupont",
        placeholderEmail: "jean@exemple.com",
        placeholderPhone: "+33 6 12 34 56 78",
        placeholderMessage: "Décrivez vos besoins…",
        submitButton: "Soumettre le Lead",
        submitting: "Envoi en cours…",
        successMessage: "Lead soumis avec succès !",
        errorMessage: "Une erreur est survenue. Veuillez réessayer.",
        required: "Ce champ est obligatoire",
        nameTooShort: "Le nom doit comporter au moins 2 caractères",
        invalidEmail: "Entrez une adresse email valide",
        invalidPhone: "Entrez un numéro de téléphone valide",
        messageTooShort: "Le message doit comporter au moins 10 caractères",
    },
    de: {
        pageTitle: "Lead Einreichen",
        pageSubtitle: "Füllen Sie die Details unten aus. Alle Felder sind erforderlich.",
        labelName: "Vollständiger Name",
        labelEmail: "E-Mail-Adresse",
        labelPhone: "Telefonnummer",
        labelMessage: "Nachricht",
        labelLanguage: "Sprache",
        placeholderName: "Max Mustermann",
        placeholderEmail: "max@beispiel.de",
        placeholderPhone: "+49 151 1234 5678",
        placeholderMessage: "Beschreiben Sie Ihre Anforderungen…",
        submitButton: "Lead Einreichen",
        submitting: "Wird gesendet…",
        successMessage: "Lead erfolgreich eingereicht!",
        errorMessage: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
        required: "Dieses Feld ist erforderlich",
        nameTooShort: "Der Name muss mindestens 2 Zeichen lang sein",
        invalidEmail: "Geben Sie eine gültige E-Mail-Adresse ein",
        invalidPhone: "Geben Sie eine gültige Telefonnummer ein",
        messageTooShort: "Die Nachricht muss mindestens 10 Zeichen lang sein",
    },
    ar: {
        pageTitle: "إرسال عميل محتمل",
        pageSubtitle: "املأ التفاصيل أدناه. جميع الحقول مطلوبة.",
        labelName: "الاسم الكامل",
        labelEmail: "البريد الإلكتروني",
        labelPhone: "رقم الهاتف",
        labelMessage: "الرسالة",
        labelLanguage: "اللغة",
        placeholderName: "أحمد محمد",
        placeholderEmail: "ahmed@example.com",
        placeholderPhone: "+966 50 123 4567",
        placeholderMessage: "أخبرنا عن متطلباتك…",
        submitButton: "إرسال العميل المحتمل",
        submitting: "جارٍ الإرسال…",
        successMessage: "تم الإرسال بنجاح!",
        errorMessage: "حدث خطأ. يرجى المحاولة مرة أخرى.",
        required: "هذا الحقل مطلوب",
        nameTooShort: "يجب أن يحتوي الاسم على حرفين على الأقل",
        invalidEmail: "أدخل بريدًا إلكترونيًا صالحًا",
        invalidPhone: "أدخل رقم هاتف صالح",
        messageTooShort: "يجب أن تحتوي الرسالة على 10 أحرف على الأقل",
    },
    pt: {
        pageTitle: "Enviar um Lead",
        pageSubtitle: "Preencha os detalhes abaixo. Todos os campos são obrigatórios.",
        labelName: "Nome Completo",
        labelEmail: "Endereço de Email",
        labelPhone: "Número de Telefone",
        labelMessage: "Mensagem",
        labelLanguage: "Idioma",
        placeholderName: "João Silva",
        placeholderEmail: "joao@exemplo.com",
        placeholderPhone: "+55 11 91234 5678",
        placeholderMessage: "Conte-nos sobre suas necessidades…",
        submitButton: "Enviar Lead",
        submitting: "Enviando…",
        successMessage: "Lead enviado com sucesso!",
        errorMessage: "Algo deu errado. Tente novamente.",
        required: "Este campo é obrigatório",
        nameTooShort: "O nome deve ter pelo menos 2 caracteres",
        invalidEmail: "Insira um endereço de email válido",
        invalidPhone: "Insira um número de telefone válido",
        messageTooShort: "A mensagem deve ter pelo menos 10 caracteres",
    },
    zh: {
        pageTitle: "提交线索",
        pageSubtitle: "请填写以下信息。所有字段均为必填。",
        labelName: "姓名",
        labelEmail: "电子邮件",
        labelPhone: "电话号码",
        labelMessage: "留言",
        labelLanguage: "语言",
        placeholderName: "张伟",
        placeholderEmail: "zhangwei@example.com",
        placeholderPhone: "+86 138 0013 8000",
        placeholderMessage: "请描述您的需求…",
        submitButton: "提交线索",
        submitting: "提交中…",
        successMessage: "线索提交成功！",
        errorMessage: "出了点问题，请重试。",
        required: "此字段为必填项",
        nameTooShort: "姓名至少需要2个字符",
        invalidEmail: "请输入有效的电子邮件地址",
        invalidPhone: "请输入有效的电话号码",
        messageTooShort: "留言至少需要10个字符",
    },
};

/**
 * Get translations for a given language code.
 * Falls back to English if the code is unsupported.
 */
export function getTranslations(lang: string): TranslationStrings {
    const prefix = lang.slice(0, 2).toLowerCase() as SupportedLang;
    return translations[prefix] ?? translations.en;
}

/**
 * Detect the user's preferred language from the browser.
 * Returns the best matching SupportedLang code, defaulting to "en".
 */
export function detectBrowserLanguage(): SupportedLang {
    if (typeof navigator === "undefined") return "en";

    const browserLang = navigator.language?.slice(0, 2).toLowerCase() ?? "en";
    const supported = SUPPORTED_LANGUAGES.map((l) => l.code as string);

    return (supported.includes(browserLang) ? browserLang : "en") as SupportedLang;
}

export default translations;
