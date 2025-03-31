import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FileText, Search, Filter, User, Calendar, HeartPulse, 
  Pill, AlertTriangle, FilePlus, FileSearch, Brain, Download 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getAllUsers, getUserMedicalRecords, getPatientHealthProfile, getRecordAnalysis } from "@/data/mockData";
import { User as UserType, MedicalRecord, PatientHealth, AiAnalysis } from "@/types";

export default function PatientRecords() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<UserType | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [healthProfile, setHealthProfile] = useState<PatientHealth | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [recordAnalysis, setRecordAnalysis] = useState<AiAnalysis | null>(null);
  
  useEffect(() => {
    // Redirect if not a doctor
    if (user?.role !== "doctor") {
      navigate("/dashboard");
      return;
    }
    
    // Get all patients
    const allUsers = getAllUsers().filter(u => u.role === "patient");
    setPatients(allUsers);
  }, [user, navigate]);
  
  // Filter patients based on search term
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle patient selection
  const handlePatientSelect = (patient: UserType) => {
    setSelectedPatient(patient);
    
    // Get patient's medical records
    const records = getUserMedicalRecords(patient.id);
    setMedicalRecords(records);
    
    // Get patient's health profile
    const profile = getPatientHealthProfile(patient.id);
    setHealthProfile(profile || null);
    
    // Clear selected record and analysis
    setSelectedRecord(null);
    setRecordAnalysis(null);
  };
  
  // Handle medical record selection
  const handleRecordSelect = (record: MedicalRecord) => {
    setSelectedRecord(record);
    
    // Get AI analysis if available
    const analysis = getRecordAnalysis(record.id);
    setRecordAnalysis(analysis || null);
  };
  
  return (
    <AppLayout title="Patient Records" showBack={false}>
      <div className="grid grid-cols-12 gap-4 p-4">
        {/* Left sidebar - Patient list */}
        <div className="col-span-12 md:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" /> Patients
              </CardTitle>
              <div className="relative mt-2">
                <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Search patients..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="max-h-[calc(100vh-250px)] overflow-y-auto space-y-2">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className={`flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
                      selectedPatient?.id === patient.id ? 'bg-gray-100 dark:bg-gray-800' : ''
                    }`}
                    onClick={() => handlePatientSelect(patient)}
                  >
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={patient.avatar} alt={patient.name} />
                      <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-gray-500">{patient.email}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>No patients found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Middle section - Medical records */}
        <div className="col-span-12 md:col-span-4 space-y-4">
          {selectedPatient ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" /> Medical Records
                </CardTitle>
                <CardDescription>
                  {selectedPatient.name}'s medical history
                </CardDescription>
              </CardHeader>
              <CardContent className="max-h-[calc(100vh-250px)] overflow-y-auto space-y-3">
                {medicalRecords.length > 0 ? (
                  medicalRecords.map((record) => (
                    <div
                      key={record.id}
                      className={`border p-3 rounded-lg cursor-pointer hover:border-primary ${
                        selectedRecord?.id === record.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => handleRecordSelect(record)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium truncate">{record.title}</h4>
                        <Badge className={
                          record.type === 'prescription' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                          record.type === 'diagnosis' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                          record.type === 'lab_result' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                        }>
                          {record.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{record.description}</p>
                      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                        <span><Calendar className="inline w-3 h-3 mr-1" />{record.date}</span>
                        {record.isPrivate && (
                          <span className="text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="inline w-3 h-3 mr-1" />Private
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No medical records available</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => {}} // This would open a form to add a new record
                    >
                      <FilePlus className="w-4 h-4 mr-2" /> Add Record
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <User className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-center text-gray-500">
                  Select a patient to view their medical records
                </p>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Right section - Record details and health profile */}
        <div className="col-span-12 md:col-span-5 space-y-4">
          {selectedPatient ? (
            selectedRecord ? (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedRecord.title}</CardTitle>
                  <CardDescription>
                    {selectedRecord.date} • {selectedRecord.type.replace('_', ' ')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Description</h4>
                    <p>{selectedRecord.description}</p>
                  </div>
                  
                  {selectedRecord.notes && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Notes</h4>
                      <p>{selectedRecord.notes}</p>
                    </div>
                  )}
                  
                  {selectedRecord.fileUrl && (
                    <div>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" /> Download Document
                      </Button>
                    </div>
                  )}
                  
                  {recordAnalysis && (
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center mb-2">
                        <Brain className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                        <h3 className="font-medium">AI Analysis</h3>
                        <Badge className="ml-2 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                          {Math.round(recordAnalysis.confidence * 100)}% confident
                        </Badge>
                      </div>
                      
                      <p className="mb-2">{recordAnalysis.summary}</p>
                      
                      {recordAnalysis.keyFindings.length > 0 && (
                        <div className="mb-2">
                          <h4 className="text-sm font-medium mb-1">Key Findings</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {recordAnalysis.keyFindings.map((finding, index) => (
                              <li key={index} className="text-sm">{finding}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {recordAnalysis.recommendations.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Recommendations</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {recordAnalysis.recommendations.map((rec, index) => (
                              <li key={index} className="text-sm">{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <div className="flex space-x-2">
                    <Button onClick={() => {}} className="bg-primary hover:bg-primary/90">
                      <Brain className="w-4 h-4 mr-2" /> Generate AI Analysis
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedRecord(null)}>
                      Back to Records
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ) : (
              <Tabs defaultValue="summary">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="summary">Health Summary</TabsTrigger>
                  <TabsTrigger value="details">Health Details</TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="w-5 h-5 mr-2" /> {selectedPatient.name}
                      </CardTitle>
                      <CardDescription>
                        Patient Health Summary
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {healthProfile ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                              <div className="text-blue-600 dark:text-blue-400 font-medium mb-1 flex items-center">
                                <HeartPulse className="w-4 h-4 mr-1" /> Blood Pressure
                              </div>
                              <div className="text-xl font-bold">{healthProfile.healthMetrics.bloodPressure || 'N/A'}</div>
                            </div>
                            
                            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                              <div className="text-green-600 dark:text-green-400 font-medium mb-1 flex items-center">
                                <HeartPulse className="w-4 h-4 mr-1" /> Heart Rate
                              </div>
                              <div className="text-xl font-bold">{healthProfile.healthMetrics.heartRate || 'N/A'} bpm</div>
                            </div>
                            
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                              <div className="text-purple-600 dark:text-purple-400 font-medium mb-1 flex items-center">
                                <HeartPulse className="w-4 h-4 mr-1" /> Blood Sugar
                              </div>
                              <div className="text-xl font-bold">{healthProfile.healthMetrics.bloodSugar || 'N/A'} mg/dL</div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-2">Chronic Conditions</h4>
                            <div className="flex flex-wrap gap-2">
                              {healthProfile.chronicConditions.length > 0 ? (
                                healthProfile.chronicConditions.map((condition, index) => (
                                  <Badge key={index} variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                                    {condition}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-gray-500 text-sm">No chronic conditions reported</span>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-2">Allergies</h4>
                            <div className="flex flex-wrap gap-2">
                              {healthProfile.allergies.length > 0 ? (
                                healthProfile.allergies.map((allergy, index) => (
                                  <Badge key={index} variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    {allergy}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-gray-500 text-sm">No allergies reported</span>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-2">Current Medications</h4>
                            <div className="space-y-2">
                              {healthProfile.medications.length > 0 ? (
                                healthProfile.medications.map((med, index) => (
                                  <div key={index} className="flex items-start bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                                    <Pill className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400 mt-0.5" />
                                    <div>
                                      <div className="font-medium">{med.name}</div>
                                      <div className="text-sm text-gray-500">
                                        {med.dosage} • {med.frequency}
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <span className="text-gray-500 text-sm">No medications currently prescribed</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No health profile available for this patient</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="details">
                  <Card>
                    <CardHeader>
                      <CardTitle>Detailed Health Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {healthProfile ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium mb-1">Height</h4>
                              <p>{healthProfile.healthMetrics.height || 'N/A'} cm</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium mb-1">Weight</h4>
                              <p>{healthProfile.healthMetrics.weight || 'N/A'} kg</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium mb-1">Blood Pressure</h4>
                              <p>{healthProfile.healthMetrics.bloodPressure || 'N/A'}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium mb-1">Blood Sugar</h4>
                              <p>{healthProfile.healthMetrics.bloodSugar || 'N/A'} mg/dL</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium mb-1">Heart Rate</h4>
                              <p>{healthProfile.healthMetrics.heartRate || 'N/A'} bpm</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium mb-1">Oxygen Level</h4>
                              <p>{healthProfile.healthMetrics.oxygenLevel || 'N/A'}%</p>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-1">Family History</h4>
                            <p>{healthProfile.familyHistory || 'No family history recorded'}</p>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-1">Last Updated</h4>
                            <p>{healthProfile.lastUpdated}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No health profile available for this patient</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileSearch className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-center text-gray-500">
                  Select a patient to view their health information
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
} 