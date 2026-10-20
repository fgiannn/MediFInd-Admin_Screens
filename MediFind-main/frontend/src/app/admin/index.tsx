import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Icon, type IconName } from '../../components/icon';
import { Text } from '../../components/typography';

type Status = 'Pending' | 'Needs Info' | 'Approved' | 'Rejected';
type Pharmacy = { id: string; name: string; address: string; date: string; applicant: string; email: string; status: Status; notes?: string };
type Medicine = { id: string; name: string; description: string; pharmacy: string; date: string; status: 'Pending' | 'Approved' | 'Rejected' };
type Tab = 'dashboard' | 'pharmacies' | 'catalog' | 'profile';
const initialPharmacies: Pharmacy[] = [
  { id: 'PH-00128', name: 'HealthPlus Pharmacy', address: 'Corrales Ave., Cagayan de Oro City', date: '20 Oct 2026', applicant: 'Applicant A.', email: 'applicant@example.com', status: 'Pending' },
  { id: 'PH-00127', name: 'CarePoint Pharmacy', address: 'Lapasan, Cagayan de Oro City', date: '19 Oct 2026', applicant: 'Applicant B.', email: 'carepoint@example.com', status: 'Pending' },
  { id: 'PH-00126', name: 'MediCare Pharmacy', address: 'Carmen, Cagayan de Oro City', date: '19 Oct 2026', applicant: 'Applicant C.', email: 'medicare@example.com', status: 'Pending' },
];
const initialMedicines: Medicine[] = [
  { id: 'MD-001', name: 'Sample Medicine A', description: '500 mg · Tablet', pharmacy: 'HealthPlus Pharmacy', date: '20 Oct 2026', status: 'Pending' },
  { id: 'MD-002', name: 'Sample Medicine B', description: '250 mg · Capsule', pharmacy: 'CarePoint Pharmacy', date: '20 Oct 2026', status: 'Pending' },
  { id: 'MD-003', name: 'Sample Medicine C', description: '10 mg · Tablet', pharmacy: 'MediCare Pharmacy', date: '19 Oct 2026', status: 'Pending' },
];
const C = { teal: '#087F7A', pale: '#E3F5F3', ink: '#172220', muted: '#68716F', bg: '#F1F2F2', white: '#FFFFFF', line: '#E4E8E7', amber: '#FFF0D0', amberText: '#A26400', red: '#B13A38' };
const S = StyleSheet.create({ page: { flex: 1, backgroundColor: C.bg }, content: { padding: 14, gap: 12, paddingBottom: 36, width: '100%', maxWidth: 650, alignSelf: 'center' }, card: { backgroundColor: C.white, borderRadius: 9, padding: 14, gap: 9 }, heading: { fontSize: 16, fontWeight: '700', color: C.ink }, title: { fontSize: 18, fontWeight: '700', color: C.ink }, label: { fontSize: 13, color: C.muted }, small: { fontSize: 11, color: C.muted }, row: { flexDirection: 'row', alignItems: 'center', gap: 10 }, between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, button: { minHeight: 39, backgroundColor: C.teal, borderRadius: 5, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 }, buttonText: { color: C.white, fontSize: 13, fontWeight: '700' }, input: { backgroundColor: C.white, borderRadius: 8, borderWidth: 1, borderColor: C.line, paddingHorizontal: 12, paddingVertical: 11, color: C.ink, fontSize: 13 }, divider: { height: 1, backgroundColor: C.line }, filter: { paddingHorizontal: 13, paddingVertical: 10, backgroundColor: C.white, borderRadius: 24 }, stat: { flex: 1, backgroundColor: C.white, borderRadius: 7, minHeight: 84, padding: 12, gap: 5 }, nav: { flexDirection: 'row', backgroundColor: C.white, borderTopWidth: 1, borderColor: C.line, paddingVertical: 7 }, navItem: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 4 }, formInput: { borderWidth: 1, borderColor: C.line, borderRadius: 6, minHeight: 70, padding: 10, textAlignVertical: 'top', color: C.ink, backgroundColor: C.white } });
function Pill({ value }: { value: string }) { const isPending = value === 'Pending'; const isRejected = value === 'Rejected'; return <View style={{ paddingHorizontal: 9, paddingVertical: 5, borderRadius: 5, backgroundColor: isPending ? C.amber : isRejected ? '#FCE7E7' : value === 'Approved' ? C.pale : '#EDF0F0' }}><Text style={{ fontSize: 10, color: isPending ? C.amberText : isRejected ? C.red : value === 'Approved' ? C.teal : C.muted, fontWeight: '600' }}>{value}</Text></View>; }
function Action({ title, onPress, outline, danger }: { title: string; onPress: () => void; outline?: boolean; danger?: boolean }) { return <Pressable onPress={onPress} accessibilityRole="button" style={[S.button, outline && { backgroundColor: C.white, borderWidth: 1, borderColor: danger ? C.red : C.teal }]}><Text style={[S.buttonText, outline && { color: danger ? C.red : C.teal }]}>{title}</Text></Pressable>; }
function NavRow({ icon, text, onPress, highlighted }: { icon: IconName; text: string; onPress: () => void; highlighted?: boolean }) { return <Pressable onPress={onPress} style={[S.between, { minHeight: 49, paddingHorizontal: 10, borderRadius: 6, backgroundColor: highlighted ? C.pale : C.white }]}><View style={S.row}><Icon name={icon} size={22} color={highlighted ? C.teal : C.ink}/><Text style={{ fontSize: 13, fontWeight: '600', color: C.ink }}>{text}</Text></View><Text style={S.title}>›</Text></Pressable>; }
export default function AdminScreens() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [medicineId, setMedicineId] = useState<string | null>(null);
  const [pharmacies, setPharmacies] = useState(initialPharmacies);
  const [medicines, setMedicines] = useState(initialMedicines);
  const [statusFilter, setStatusFilter] = useState<Status>('Pending');
  const [catalogFilter, setCatalogFilter] = useState<'Pending' | 'Approved'>('Pending');
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPharmacy, setNewPharmacy] = useState('');
  const { width } = useWindowDimensions();
  const detail = pharmacies.find(p => p.id === detailId);
  const medicine = medicines.find(m => m.id === medicineId);
  const pendingCount = pharmacies.filter(p => p.status === 'Pending').length;
  const pendingMedCount = medicines.filter(m => m.status === 'Pending').length;
  const filteredPharmacies = useMemo(() => pharmacies.filter(p => p.status === statusFilter && `${p.name} ${p.address}`.toLowerCase().includes(search.toLowerCase())), [pharmacies, search, statusFilter]);
  const filteredMedicines = useMemo(() => medicines.filter(m => m.status === catalogFilter && `${m.name} ${m.pharmacy}`.toLowerCase().includes(search.toLowerCase())), [medicines, search, catalogFilter]);
  function move(next: Tab) { setTab(next); setDetailId(null); setMedicineId(null); setSearch(''); setAdding(false); setMenuOpen(false); }
  function selectPharmacy(p: Pharmacy) { setDetailId(p.id); setNotes(p.notes || ''); }
  function updatePharmacy(status: Status) {
    if (!detail) return;
    if (status !== 'Approved' && !notes.trim()) { Alert.alert('Review notes required', 'Please enter a reason before requesting information or rejecting.'); return; }
    setPharmacies(prev => prev.map(p => p.id === detail.id ? { ...p, status, notes: notes.trim() } : p));
    setDetailId(null); setStatusFilter(status === 'Pending' ? 'Pending' : status);
    Alert.alert('Review saved', `${detail.name} marked ${status.toLowerCase()} (demo only).`);
  }
  function updateMedicine(status: 'Approved' | 'Rejected') {
    if (!medicine) return;
    setMedicines(prev => prev.map(m => m.id === medicine.id ? { ...m, status } : m));
    setMedicineId(null); setCatalogFilter(status);
    Alert.alert('Request updated', `${medicine.name} marked ${status.toLowerCase()} (demo only).`);
  }
  const back = () => { if (medicineId) setMedicineId(null); else if (detailId) setDetailId(null); else move('dashboard'); };
  const title = detailId ? 'Application Details' : medicineId ? 'Medicine Request' : tab === 'dashboard' ? 'Admin Dashboard' : tab === 'pharmacies' ? 'Pharmacy Approval' : tab === 'catalog' ? 'Medicine Catalog' : 'Admin Profile';
  return <View style={S.page}>
    <View style={{ backgroundColor: C.white, minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, borderBottomWidth: 1, borderColor: C.line }}>
      {tab !== 'dashboard' || detailId || medicineId ? <Pressable onPress={back} accessibilityLabel="Back" style={{ padding: 8 }}><Icon name="back" color={C.ink} size={20}/></Pressable> : <View style={{ width: 36 }}/>}<Text style={S.title}>{title}</Text><Pressable accessibilityLabel="Open admin menu" onPress={() => setMenuOpen(!menuOpen)} style={{ padding: 8 }}><Text style={{ fontSize: 22, color: C.ink }}>≡</Text></Pressable>
    </View>
    {menuOpen && <View style={{ backgroundColor: C.white, paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderColor: C.line }}>{(['dashboard','pharmacies','catalog','profile'] as Tab[]).map(item => <Pressable key={item} onPress={() => move(item)} style={{ padding: 10 }}><Text style={{ color: C.ink, textTransform: 'capitalize' }}>{item}</Text></Pressable>)}<Pressable onPress={() => router.replace('/')} style={{ padding: 10 }}><Text style={{ color: C.teal }}>Go to customer preview</Text></Pressable></View>}
    <ScrollView style={{ flex: 1 }} contentContainerStyle={[S.content, width >= 700 && { paddingTop: 24 }]} keyboardShouldPersistTaps="handled">
    {tab === 'dashboard' && !detail && !medicine && <>
      <View style={[S.card, S.row, { paddingVertical: 18 }]}><Icon name="profile" size={36}/><View style={{ flex: 1 }}><Text style={S.heading}>Welcome, Admin</Text><Text style={S.label}>Manage pharmacies and the medicine catalog</Text></View></View>
      <Text style={S.heading}>Overview</Text>
      <View style={S.row}><View style={S.stat}><Icon name="pharmacy" color="#D98200"/><Text style={{ fontWeight: '700', fontSize: 25, color: C.ink }}>{pendingCount + 3}</Text><Text style={S.small}>Pending pharmacies*</Text></View><View style={S.stat}><Icon name="pharmacy"/><Text style={{ fontWeight: '700', fontSize: 25, color: C.ink }}>{24 + pharmacies.filter(p => p.status === 'Approved').length}</Text><Text style={S.small}>Approved pharmacies*</Text></View></View>
      <View style={S.row}><View style={S.stat}><Icon name="prescription"/><Text style={{ fontWeight: '700', fontSize: 25, color: C.ink }}>{148 + medicines.filter(m => m.status === 'Approved').length}</Text><Text style={S.small}>Active medicines*</Text></View><View style={S.stat}><Icon name="prescription" color={C.muted}/><Text style={{ fontWeight: '700', fontSize: 25, color: C.ink }}>9</Text><Text style={S.small}>Inactive medicines*</Text></View></View>
      <View style={S.card}><Text style={S.heading}>Quick actions</Text><NavRow icon="pharmacy" text="Review Pharmacies" highlighted onPress={() => move('pharmacies')}/><NavRow icon="prescription" text="Manage Medicine Catalog" onPress={() => move('catalog')}/></View>
      <View style={S.card}><Text style={S.heading}>Recent activity</Text><View style={S.divider}/><View style={S.between}><View style={[S.row, { flex: 1 }]}><Icon name="pharmacy" color="#D98200"/><View style={{ flex: 1 }}><Text style={{ fontWeight: '600', color: C.ink, fontSize: 12 }}>New pharmacy registration</Text><Text style={S.small}>HealthPlus Pharmacy · 5 minutes ago</Text></View></View><Pill value="Pending"/></View><View style={S.divider}/><View style={S.between}><View style={[S.row, { flex: 1 }]}><Icon name="pharmacy"/><View style={{ flex: 1 }}><Text style={{ fontWeight: '600', color: C.ink, fontSize: 12 }}>Pharmacy approved</Text><Text style={S.small}>CarePoint Pharmacy · 30 minutes ago</Text></View></View><Pill value="Approved"/></View><View style={S.divider}/><View style={S.row}><Icon name="prescription" color={C.muted}/><View><Text style={{ fontWeight: '600', color: C.ink, fontSize: 12 }}>Medicine catalog updated</Text><Text style={S.small}>1 record edited · 1 hour ago</Text></View></View></View>
      <Text style={S.small}>*Overview baseline counts are mockup samples, not live database totals.</Text>
    </>}
    {tab === 'pharmacies' && !detail && <>
      <View style={[S.row, { backgroundColor: C.white, borderRadius: 8, paddingLeft: 12 }]}><Icon name="search" color={C.muted} size={18}/><TextInput value={search} onChangeText={setSearch} placeholder="Search pharmacy or location" style={{ flex: 1, padding: 12, fontSize: 13 }} placeholderTextColor={C.muted}/></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>{(['Pending','Needs Info','Approved','Rejected'] as Status[]).map(status => <Pressable key={status} onPress={() => setStatusFilter(status)} style={[S.filter, statusFilter === status && { backgroundColor: C.teal }]}><Text style={{ color: statusFilter === status ? C.white : C.ink, fontSize: 12 }}>{status}</Text></Pressable>)}</ScrollView>
      <Text style={S.label}>{filteredPharmacies.length} {statusFilter.toLowerCase()} applications</Text>
      {filteredPharmacies.map(p => <View key={p.id} style={S.card}><View style={[S.row, { alignItems: 'flex-start' }]}><Icon name="pharmacy" size={35} color={C.ink}/><View style={{ flex: 1, gap: 4 }}><View style={S.between}><Text style={[S.heading, { flex: 1 }]}>{p.name}</Text><Pill value={p.status}/></View><View style={S.row}><Icon name="map-pin" size={12} color={C.muted}/><Text style={S.small}>{p.address}</Text></View><View style={S.row}><Icon name="clock" size={12} color={C.muted}/><Text style={S.small}>Submitted {p.date}</Text></View></View></View><Action title="Review Application" onPress={() => selectPharmacy(p)}/></View>)}
      {!filteredPharmacies.length && <View style={S.card}><Text style={S.label}>No applications match this filter.</Text></View>}
      <View style={[S.card, S.row, { backgroundColor: C.pale }]}><Icon name="alert" color={C.teal} size={18}/><Text style={[S.small, { flex: 1, color: C.teal }]}>Check pharmacy details and supporting documents before approval.</Text></View>
    </>}
    {detail && <>
      <View style={[S.card, S.row, { paddingVertical: 18 }]}><Icon name="pharmacy" size={38} color={C.ink}/><View style={{ flex: 1 }}><Text style={S.heading}>{detail.name}</Text><Text style={S.small}>Application #{detail.id}</Text><Text style={S.small}>Submitted {detail.date}</Text></View><Pill value={detail.status}/></View>
      <View style={S.card}><Text style={S.heading}>Pharmacy information</Text><View style={S.divider}/>{[['Branch','Main branch'],['Address',detail.address],['Applicant',detail.applicant],['Email',detail.email],['Contact number','Not provided']].map(([label, value]) => <View key={label} style={[S.row, { alignItems: 'flex-start' }]}><Text style={[S.label, { width: 108 }]}>{label}</Text><Text style={[S.label, { flex: 1, color: C.ink }]}>{value}</Text></View>)}</View>
      <View style={S.card}><Text style={S.heading}>Supporting documents</Text>{['FDA license.pdf','Business permit.pdf','Pharmacist credentials.pdf'].map(file => <View key={file}><View style={S.divider}/><View style={S.between}><View style={S.row}><Icon name="prescription" size={18} color={C.ink}/><Text style={{ fontSize: 12, color: C.ink }}>{file}</Text></View><Pressable onPress={() => Alert.alert('Demo document', 'Actual document URLs are not connected yet.')}><Text style={{ color: C.teal, fontSize: 12, fontWeight: '600' }}>View</Text></Pressable></View></View>)}<Text style={S.small}>Submitted documents require review. Demo filenames only.</Text></View>
      <View style={S.card}><Text style={S.heading}>Review notes</Text><TextInput style={S.formInput} multiline value={notes} onChangeText={setNotes} placeholder="Enter findings or information needed..." placeholderTextColor={C.muted}/></View>
      <Action title="Approve Pharmacy" onPress={() => updatePharmacy('Approved')}/><View style={{ flexDirection: 'row', gap: 8 }}><View style={{ flex: 1 }}><Action title="Request Info" outline onPress={() => updatePharmacy('Needs Info')}/></View><View style={{ flex: 1 }}><Action title="Reject" outline danger onPress={() => updatePharmacy('Rejected')}/></View></View><Text style={S.small}>A reason is required for rejection or information requests.</Text>
    </>}
    {tab === 'catalog' && !medicine && <>
      <View style={[S.row, { backgroundColor: C.white, borderRadius: 8, paddingLeft: 12 }]}><Icon name="search" color={C.muted} size={18}/><TextInput value={search} onChangeText={setSearch} placeholder="Search medicine or pharmacy" style={{ flex: 1, padding: 12, fontSize: 13 }} placeholderTextColor={C.muted}/></View>
      <View style={S.row}>{(['Approved','Pending'] as const).map(filter => <Pressable key={filter} style={{ flex: 1, borderBottomWidth: catalogFilter === filter ? 2 : 1, borderColor: catalogFilter === filter ? C.teal : C.line, padding: 13, alignItems: 'center' }} onPress={() => setCatalogFilter(filter)}><Text style={{ color: catalogFilter === filter ? C.teal : C.muted, fontSize: 13, fontWeight: catalogFilter === filter ? '700' : '400' }}>{filter === 'Pending' ? `Pending Requests (${pendingMedCount})` : 'Approved Catalog'}</Text></Pressable>)}</View>
      <View style={S.between}><Text style={S.label}>{filteredMedicines.length} {catalogFilter.toLowerCase()} medicines</Text><Pressable onPress={() => setAdding(!adding)} style={S.row}><Icon name="plus" size={15}/><Text style={{ color: C.teal, fontSize: 12 }}>Add Medicine</Text></Pressable></View>
      {adding && <View style={S.card}><Text style={S.heading}>Add medicine (demo)</Text><TextInput style={S.input} placeholder="Medicine name" value={newName} onChangeText={setNewName}/><TextInput style={S.input} placeholder="Strength and form" value={newDescription} onChangeText={setNewDescription}/><TextInput style={S.input} placeholder="Pharmacy name" value={newPharmacy} onChangeText={setNewPharmacy}/><Action title="Add to Pending Requests" onPress={() => { if (!newName.trim() || !newDescription.trim() || !newPharmacy.trim()) { Alert.alert('Missing details', 'Fill out all fields.'); return; } setMedicines(prev => [{ id: `MD-${Date.now()}`, name: newName.trim(), description: newDescription.trim(), pharmacy: newPharmacy.trim(), date: '20 Oct 2026', status: 'Pending' }, ...prev]); setNewName(''); setNewDescription(''); setNewPharmacy(''); setAdding(false); setCatalogFilter('Pending'); }}/></View>}
      {filteredMedicines.map(m => <View key={m.id} style={S.card}><View style={[S.row, { alignItems: 'flex-start' }]}><Icon name="medicine" size={31} color={C.ink}/><View style={{ flex: 1, gap: 3 }}><View style={S.between}><Text style={[S.heading, { flex: 1 }]}>{m.name}</Text><Pill value={m.status}/></View><Text style={{ color: C.ink, fontSize: 12 }}>{m.description}</Text><Text style={S.small}>Submitted by {m.pharmacy}</Text><Text style={S.small}>{m.date}</Text></View></View><Action title={m.status === 'Pending' ? 'Review Request' : 'View Medicine'} onPress={() => setMedicineId(m.id)}/></View>)}
      {!filteredMedicines.length && <View style={S.card}><Text style={S.label}>No medicines match this filter.</Text></View>}
      <View style={[S.card, S.row, { backgroundColor: C.pale }]}><Icon name="alert" size={18}/><Text style={[S.small, { flex: 1, color: C.teal }]}>Check product details, references, and duplicates before approval.</Text></View>
    </>}
    {medicine && <><View style={S.card}><View style={S.between}><Text style={S.heading}>{medicine.name}</Text><Pill value={medicine.status}/></View>{[['Strength / form',medicine.description],['Submitted by',medicine.pharmacy],['Date',medicine.date],['Request ID',medicine.id]].map(([k, v]) => <View key={k} style={S.between}><Text style={S.label}>{k}</Text><Text style={{ color: C.ink, fontSize: 13 }}>{v}</Text></View>)}</View><View style={[S.card, { backgroundColor: C.pale }]}><Text style={S.label}>Demo request only. Verify regulatory status, labeling, and product information outside the app before approving any real listing.</Text></View>{medicine.status === 'Pending' && <><Action title="Approve Medicine" onPress={() => updateMedicine('Approved')}/><Action title="Reject Request" outline danger onPress={() => Alert.alert('Reject medicine?', `Reject ${medicine.name}?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Reject', style: 'destructive', onPress: () => updateMedicine('Rejected') }])}/></>}</>}
    {tab === 'profile' && <View style={S.card}><Icon name="profile" size={42}/><Text style={S.heading}>Administrator (demo)</Text><Text style={S.label}>Admin screens are available for preview. Role-based login and persistent backend data are not connected.</Text><Action title="Return to Customer Preview" outline onPress={() => router.replace('/')}/></View>}
    </ScrollView>
    <View style={S.nav}>{([{ key: 'dashboard', label: 'Dashboard', icon: 'home' }, { key: 'pharmacies', label: 'Pharmacies', icon: 'pharmacy' }, { key: 'catalog', label: 'Catalog', icon: 'prescription' }, { key: 'profile', label: 'Profile', icon: 'profile' }] as { key: Tab; label: string; icon: IconName }[]).map(n => <Pressable key={n.key} onPress={() => move(n.key)} style={S.navItem} accessibilityRole="tab" accessibilityState={{ selected: tab === n.key }}><Icon name={n.icon} size={22} color={tab === n.key ? C.teal : C.ink}/><Text style={{ fontSize: 11, fontWeight: tab === n.key ? '700' : '400', color: tab === n.key ? C.teal : C.ink }}>{n.label}{n.key === 'pharmacies' && pendingCount ? ` (${pendingCount})` : ''}</Text></Pressable>)}</View>
  </View>;
}
