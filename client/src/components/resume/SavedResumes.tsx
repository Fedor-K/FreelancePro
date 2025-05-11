import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileEdit, Trash2, FileText, Copy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface SavedResumesProps {
  onEdit: (id?: number) => void;
}

export default function SavedResumes({ onEdit }: SavedResumesProps) {
  const { toast } = useToast();
  
  // Placeholder for resume data
  // This will be replaced with actual data fetching once we have the API endpoints
  const [resumes] = useState([]);
  
  // Loading state visual placeholder
  if (false) { // Change to true to see loading state
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-2/5" />
            </CardHeader>
            <CardContent className="pb-2">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  // Empty state
  if (resumes.length === 0) {
    return (
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertTitle>No resumes yet</AlertTitle>
        <AlertDescription>
          You haven't created any resumes yet. Create your first resume to see it here.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* This will be populated with actual resumes once we have the backend set up */}
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertTitle>Resume functionality coming soon</AlertTitle>
        <AlertDescription>
          We're currently building the resume management features. Check back soon!
        </AlertDescription>
      </Alert>
      
      {/* Example resume card - will be populated from API */}
      {false && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Professional Translator Resume</CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm text-muted-foreground">
              Created on May 10, 2025 • Targeted for Technical Translation position
            </p>
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={() => {}}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button size="sm" variant="outline" onClick={() => {}}>
                <Copy className="h-4 w-4 mr-1" />
                Duplicate
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={() => onEdit()}>
                <FileEdit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button size="sm" variant="destructive" onClick={() => {}}>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}