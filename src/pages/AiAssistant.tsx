import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AiAssistant() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the enhanced AIChat component
    navigate('/ai');
  }, [navigate]);

  return null; // No need to render anything as we're redirecting
}
