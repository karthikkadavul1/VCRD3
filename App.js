import React, { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, Alert, Platform, StatusBar, Animated,
  KeyboardAvoidingView, Modal, Share
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

// ── Color palette ──────────────────────────────────────────
const COLORS = {
  primary:    '#1A237E',   // deep navy
  secondary:  '#283593',
  accent:     '#42A5F5',
  accentDark: '#1976D2',
  bg:         '#F0F4FF',
  card:       '#FFFFFF',
  text:       '#1A1A2E',
  subtext:    '#5C6BC0',
  border:     '#C5CAE9',
  error:      '#E53935',
  success:    '#43A047',
  gold:       '#FFD600',
};

// ── vCard builder ──────────────────────────────────────────
function buildVCard(data) {
  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${data.name}`,
    `N:${data.name};;;;`,
    data.title       ? `TITLE:${data.title}`              : '',
    data.company     ? `ORG:${data.company}`              : '',
    data.email       ? `EMAIL:${data.email}`              : '',
    data.phone       ? `TEL:${data.phone}`                : '',
    data.mobile      ? `TEL;TYPE=CELL:${data.mobile}`     : '',
    data.website     ? `URL:${data.website}`              : '',
    data.linkedin    ? `X-SOCIALPROFILE;TYPE=linkedin:${data.linkedin}` : '',
    data.address     ? `ADR:;;${data.address};;;;`        : '',
    'END:VCARD',
  ].filter(Boolean).join('\n');
}

// ── Field component ────────────────────────────────────────
function Field({ label, icon, value, onChangeText, placeholder, keyboardType, required, error }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>
        {icon} {label}{required && <Text style={{ color: COLORS.error }}> *</Text>}
      </Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9FA8DA"
        keyboardType={keyboardType || 'default'}
        autoCapitalize="none"
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

// ── Main App ───────────────────────────────────────────────
export default function App() {
  const [step, setStep]       = useState('form'); // 'form' | 'qr'
  const [errors, setErrors]   = useState({});
  const [showModal, setShowModal] = useState(false);
  const qrRef = useRef(null);

  const [form, setForm] = useState({
    name:     '',
    title:    '',
    company:  '',
    email:    '',
    phone:    '',
    mobile:   '',
    website:  '',
    linkedin: '',
    address:  '',
  });

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  // Validation
  function validate() {
    const e = {};
    if (!form.name.trim())  e.name  = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (form.phone && !/^[+\d\s\-()]{7,}$/.test(form.phone))
      e.phone = 'Enter a valid phone number';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function generateQR() {
    if (!validate()) {
      Alert.alert('Please fix the errors', 'Fill in the required fields correctly.');
      return;
    }
    setStep('qr');
  }

  function shareCard() {
    const vcard = buildVCard(form);
    Share.share({
      message: `My Digital Visiting Card\n\n👤 ${form.name}\n🏢 ${form.company}\n📧 ${form.email}\n📞 ${form.mobile || form.phone}\n🌐 ${form.website}\n\n[Scan the QR code to save my contact]`,
      title: `${form.name} - Digital Card`,
    });
  }

  const vCardData = buildVCard(form);

  // ── QR Screen ─────────────────────────────────────────────
  if (step === 'qr') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <ScrollView contentContainerStyle={styles.qrScroll}>

          {/* Header */}
          <View style={styles.qrHeader}>
            <Text style={styles.qrHeaderTitle}>Your Digital Card</Text>
            <Text style={styles.qrHeaderSub}>Scan to save contact</Text>
          </View>

          {/* Business Card Preview */}
          <View style={styles.bizCard}>
            <View style={styles.bizCardTop}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {form.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.bizName}>{form.name}</Text>
                {form.title   ? <Text style={styles.bizTitle}>{form.title}</Text>   : null}
                {form.company ? <Text style={styles.bizCompany}>{form.company}</Text> : null}
              </View>
            </View>
            <View style={styles.bizDivider} />
            <View style={styles.bizDetails}>
              {form.email   ? <Text style={styles.bizDetail}>📧  {form.email}</Text>   : null}
              {form.mobile  ? <Text style={styles.bizDetail}>📱  {form.mobile}</Text>  : null}
              {form.phone   ? <Text style={styles.bizDetail}>📞  {form.phone}</Text>   : null}
              {form.website ? <Text style={styles.bizDetail}>🌐  {form.website}</Text> : null}
              {form.linkedin? <Text style={styles.bizDetail}>💼  {form.linkedin}</Text>: null}
              {form.address ? <Text style={styles.bizDetail}>📍  {form.address}</Text> : null}
            </View>
          </View>

          {/* QR Code */}
          <View style={styles.qrBox}>
            <Text style={styles.qrLabel}>Scan with any phone camera</Text>
            <View style={styles.qrCodeWrap}>
              <QRCode
                value={vCardData}
                size={220}
                color={COLORS.primary}
                backgroundColor="#FFFFFF"
                logo={null}
                logoBorderRadius={8}
                quietZone={12}
                ref={qrRef}
              />
            </View>
            <Text style={styles.qrHint}>Opens contact details directly on the scanner's phone</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.btnShare} onPress={shareCard}>
              <Text style={styles.btnShareText}>📤  Share Card</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnEdit} onPress={() => setStep('form')}>
              <Text style={styles.btnEditText}>✏️  Edit</Text>
            </TouchableOpacity>
          </View>

          {/* vCard raw (collapsible hint) */}
          <TouchableOpacity style={styles.rawToggle} onPress={() => setShowModal(true)}>
            <Text style={styles.rawToggleText}>View vCard Data</Text>
          </TouchableOpacity>

        </ScrollView>

        {/* vCard Modal */}
        <Modal visible={showModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>vCard Data</Text>
              <ScrollView style={{ maxHeight: 300 }}>
                <Text style={styles.modalCode}>{vCardData}</Text>
              </ScrollView>
              <TouchableOpacity style={styles.modalClose} onPress={() => setShowModal(false)}>
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // ── Form Screen ───────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.formScroll}>

          {/* Header */}
          <View style={styles.formHeader}>
            <Text style={styles.formHeaderIcon}>💳</Text>
            <Text style={styles.formHeaderTitle}>Digital Visiting Card</Text>
            <Text style={styles.formHeaderSub}>Fill in your details to generate a QR card</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>

            <Text style={styles.sectionTitle}>Personal Info</Text>
            <Field label="Full Name"      icon="👤" value={form.name}     onChangeText={set('name')}     placeholder="e.g. Karthikeyan S"    required error={errors.name} />
            <Field label="Job Title"      icon="🏷️" value={form.title}    onChangeText={set('title')}    placeholder="e.g. IT Manager" />
            <Field label="Company"        icon="🏢" value={form.company}  onChangeText={set('company')}  placeholder="e.g. Hanon Systems" />

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Contact Info</Text>
            <Field label="Email"          icon="📧" value={form.email}    onChangeText={set('email')}    placeholder="you@company.com"         required keyboardType="email-address" error={errors.email} />
            <Field label="Mobile"         icon="📱" value={form.mobile}   onChangeText={set('mobile')}   placeholder="+91 98765 43210"         keyboardType="phone-pad" />
            <Field label="Office Phone"   icon="📞" value={form.phone}    onChangeText={set('phone')}    placeholder="+91 44 1234 5678"        keyboardType="phone-pad" error={errors.phone} />

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Online Presence</Text>
            <Field label="Website"        icon="🌐" value={form.website}  onChangeText={set('website')}  placeholder="https://yoursite.com"    keyboardType="url" />
            <Field label="LinkedIn"       icon="💼" value={form.linkedin} onChangeText={set('linkedin')} placeholder="linkedin.com/in/yourname" keyboardType="url" />

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Address</Text>
            <Field label="Office Address" icon="📍" value={form.address}  onChangeText={set('address')}  placeholder="Street, City, Country" />

          </View>

          {/* Generate Button */}
          <TouchableOpacity style={styles.btnGenerate} onPress={generateQR} activeOpacity={0.85}>
            <Text style={styles.btnGenerateText}>Generate QR Card  →</Text>
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            Your data stays on your device. Nothing is sent to any server.
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.bg },

  // Form screen
  formScroll:      { padding: 20, paddingBottom: 40 },
  formHeader:      { alignItems: 'center', paddingVertical: 28, backgroundColor: COLORS.primary,
                     marginHorizontal: -20, marginTop: -20, paddingHorizontal: 20, marginBottom: 24,
                     borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  formHeaderIcon:  { fontSize: 44, marginBottom: 6 },
  formHeaderTitle: { fontSize: 24, fontWeight: '800', color: '#FFF', letterSpacing: 0.5 },
  formHeaderSub:   { fontSize: 13, color: '#C5CAE9', marginTop: 4 },

  formCard:        { backgroundColor: COLORS.card, borderRadius: 20, padding: 20,
                     shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12,
                     shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  sectionTitle:    { fontSize: 12, fontWeight: '700', color: COLORS.subtext,
                     textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12 },

  fieldWrap:       { marginBottom: 14 },
  fieldLabel:      { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  input:           { backgroundColor: '#EEF0FB', borderRadius: 12, paddingHorizontal: 14,
                     paddingVertical: 11, fontSize: 14, color: COLORS.text,
                     borderWidth: 1.5, borderColor: 'transparent' },
  inputError:      { borderColor: COLORS.error, backgroundColor: '#FFF0F0' },
  errorText:       { color: COLORS.error, fontSize: 11, marginTop: 4 },

  btnGenerate:     { backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 16,
                     alignItems: 'center', marginTop: 24,
                     shadowColor: COLORS.primary, shadowOpacity: 0.4,
                     shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  btnGenerateText: { color: '#FFF', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
  footerNote:      { textAlign: 'center', color: '#9FA8DA', fontSize: 11, marginTop: 16 },

  // QR screen
  qrScroll:        { padding: 20, paddingBottom: 50, alignItems: 'center' },
  qrHeader:        { width: '100%', backgroundColor: COLORS.primary, borderRadius: 20,
                     padding: 20, alignItems: 'center', marginBottom: 20 },
  qrHeaderTitle:   { fontSize: 22, fontWeight: '800', color: '#FFF' },
  qrHeaderSub:     { fontSize: 13, color: '#C5CAE9', marginTop: 4 },

  // Business card
  bizCard:         { width: '100%', backgroundColor: COLORS.card, borderRadius: 20,
                     padding: 20, marginBottom: 20,
                     shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12,
                     shadowOffset: { width: 0, height: 4 }, elevation: 5,
                     borderLeftWidth: 5, borderLeftColor: COLORS.accent },
  bizCardTop:      { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatarCircle:    { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary,
                     alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  avatarText:      { color: '#FFF', fontSize: 20, fontWeight: '800' },
  bizName:         { fontSize: 18, fontWeight: '800', color: COLORS.text },
  bizTitle:        { fontSize: 13, color: COLORS.subtext, fontWeight: '600', marginTop: 2 },
  bizCompany:      { fontSize: 13, color: COLORS.accent,  fontWeight: '700', marginTop: 1 },
  bizDivider:      { height: 1, backgroundColor: COLORS.border, marginBottom: 12 },
  bizDetails:      { gap: 6 },
  bizDetail:       { fontSize: 13, color: COLORS.text, paddingVertical: 2 },

  // QR box
  qrBox:           { backgroundColor: COLORS.card, borderRadius: 20, padding: 24,
                     alignItems: 'center', width: '100%', marginBottom: 20,
                     shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10,
                     shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  qrLabel:         { fontSize: 14, fontWeight: '700', color: COLORS.subtext, marginBottom: 16 },
  qrCodeWrap:      { padding: 16, backgroundColor: '#FFF', borderRadius: 16,
                     borderWidth: 2, borderColor: COLORS.border,
                     shadowColor: COLORS.primary, shadowOpacity: 0.15,
                     shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  qrHint:          { fontSize: 11, color: '#9FA8DA', marginTop: 14, textAlign: 'center' },

  // Buttons
  actionRow:       { flexDirection: 'row', gap: 12, width: '100%', marginBottom: 12 },
  btnShare:        { flex: 1, backgroundColor: COLORS.primary, borderRadius: 14,
                     paddingVertical: 14, alignItems: 'center',
                     shadowColor: COLORS.primary, shadowOpacity: 0.35,
                     shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  btnShareText:    { color: '#FFF', fontWeight: '700', fontSize: 15 },
  btnEdit:         { flex: 1, backgroundColor: COLORS.card, borderRadius: 14,
                     paddingVertical: 14, alignItems: 'center',
                     borderWidth: 2, borderColor: COLORS.primary },
  btnEditText:     { color: COLORS.primary, fontWeight: '700', fontSize: 15 },

  rawToggle:       { marginTop: 4, padding: 10 },
  rawToggleText:   { color: COLORS.subtext, fontSize: 12, textDecorationLine: 'underline' },

  // Modal
  modalOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center',
                     alignItems: 'center', padding: 20 },
  modalBox:        { backgroundColor: '#FFF', borderRadius: 20, padding: 24, width: '100%' },
  modalTitle:      { fontSize: 16, fontWeight: '800', color: COLORS.primary, marginBottom: 12 },
  modalCode:       { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                     fontSize: 11, color: COLORS.text, lineHeight: 18 },
  modalClose:      { backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 10,
                     alignItems: 'center', marginTop: 16 },
  modalCloseText:  { color: '#FFF', fontWeight: '700' },
});
