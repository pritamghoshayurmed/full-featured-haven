import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, FileText, Search, Upload, AlertCircle } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AiAssistant() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("analysis");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState({
    summary: "",
    recommendations: [] as string[],
    riskFactors: [] as string[],
    nextSteps: [] as string[]
  });

  useEffect(() => {
    // Redirect to the doctor's shared AI chats view
    navigate('/doctor/ai-chats');
  }, [navigate]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // In a real app, this would send the file to an AI service for analysis
      // For now, we'll show mock data
      setAnalysis({
        summary: "Based on the uploaded medical report, the patient shows signs of moderate hypertension and elevated cholesterol levels. The ECG results indicate normal sinus rhythm with no significant abnormalities.",
        recommendations: [
          "Consider prescribing antihypertensive medication",
          "Recommend lifestyle modifications including diet and exercise",
          "Schedule follow-up appointment in 2 weeks"
        ],
        riskFactors: [
          "Family history of cardiovascular disease",
          "Sedentary lifestyle",
          "High sodium diet"
        ],
        nextSteps: [
          "Order blood work for lipid panel",
          "Prescribe blood pressure monitoring device",
          "Refer to nutritionist for dietary consultation"
        ]
      });
    }
  };

  return null; // No need to render anything as we're redirecting
} 