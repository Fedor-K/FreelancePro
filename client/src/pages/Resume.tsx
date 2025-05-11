import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, FileText, PenLine } from "lucide-react";
import ResumeBuilder from "@/components/resume/ResumeBuilder";
import SavedResumes from "@/components/resume/SavedResumes";

export default function Resume() {
  const [activeTab, setActiveTab] = useState<string>("create");
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FileText className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Resume Builder</h1>
        </div>
      </div>
      
      <Tabs defaultValue="create" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="create">Create Resume</TabsTrigger>
          <TabsTrigger value="saved">Saved Resumes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create a New Resume</CardTitle>
              <CardDescription>
                Build a professional resume tailored to your target position
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResumeBuilder />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="saved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saved Resumes</CardTitle>
              <CardDescription>
                View, edit, and manage your saved resumes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SavedResumes onEdit={() => setActiveTab("create")} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}