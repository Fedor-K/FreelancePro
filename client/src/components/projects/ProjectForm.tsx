import { useState, useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertProjectSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ClipboardList, Calendar, DollarSign } from "lucide-react";
import { Client } from "@shared/schema";

// Extend the schema with validation
const formSchema = z.object({
  name: z.string().min(2, { message: "Project name must be at least 2 characters" }),
  clientId: z.coerce.number({ invalid_type_error: "Please select a client" }),
  status: z.enum(["New", "In Progress", "Paid", "Completed"]),
  deadline: z.string().optional().nullable(),
  amount: z.coerce.number().min(0).optional().nullable(),
  description: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProjectFormProps {
  defaultValues?: Partial<FormValues>;
  projectId?: number;
  onSuccess?: () => void;
}

export function ProjectForm({ defaultValues, projectId, onSuccess }: ProjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  console.log("ProjectForm rendered with projectId:", projectId);
  console.log("ProjectForm defaultValues:", defaultValues);
  
  // Fetch clients for the select dropdown
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      name: "",
      clientId: undefined,
      description: "",
      status: "New",
      deadline: "",
      amount: undefined,
    },
  });
  
  // Update form values when defaultValues change (for edit mode)
  useEffect(() => {
    if (defaultValues) {
      console.log("Resetting form with defaultValues:", defaultValues);
      
      // Make sure to set all values explicitly to avoid undefined values
      const valuesToSet = {
        name: defaultValues.name || "",
        clientId: defaultValues.clientId,
        status: defaultValues.status || "New",
        deadline: defaultValues.deadline || "",
        amount: defaultValues.amount,
        description: defaultValues.description || "",
      };
      
      console.log("Setting form values:", valuesToSet);
      form.reset(valuesToSet);
    }
  }, [defaultValues, form]);
  
  // Debug log whenever projectId changes
  useEffect(() => {
    console.log("ProjectId changed:", projectId);
  }, [projectId]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      console.log("Submitting project with data:", data);
      console.log("Project ID:", projectId);
      
      // Ensure proper date formatting for the API
      let formattedData = { ...data };
      if (formattedData.deadline) {
        try {
          // Make sure the deadline is a valid date string in ISO format
          const date = new Date(formattedData.deadline);
          formattedData.deadline = date.toISOString();
        } catch (error) {
          console.error("Error formatting date:", error);
        }
      }
      
      console.log("Formatted data to send:", formattedData);
      
      console.log("projectId value:", projectId);
      console.log("projectId type:", typeof projectId);
      console.log("projectId condition check:", !!projectId);
      console.log("projectId conversion:", Number(projectId), Boolean(Number(projectId)));
      
      // Force projectId to be a number for comparison
      const projectIdNum = typeof projectId === 'string' ? parseInt(projectId) : projectId;
      
      if (projectIdNum && !isNaN(projectIdNum) && projectIdNum > 0) {
        // Update existing project
        console.log(`Sending PATCH request to /api/projects/${projectIdNum}`);
        await apiRequest("PATCH", `/api/projects/${projectIdNum}`, formattedData);
        toast({
          title: "Project updated",
          description: "Project has been updated successfully.",
        });
      } else {
        // Create new project
        console.log("Sending POST request to /api/projects");
        await apiRequest("POST", "/api/projects", formattedData);
        toast({
          title: "Project added",
          description: "New project has been added successfully.",
        });
      }
      
      // Invalidate and refetch projects
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      if (projectIdNum && !isNaN(projectIdNum) && projectIdNum > 0) {
        queryClient.invalidateQueries({ queryKey: ['/api/projects', projectIdNum] });
      }
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset form if creating new project
      if (!projectIdNum || isNaN(projectIdNum) || projectIdNum <= 0) {
        form.reset();
      }
    } catch (error) {
      console.error("Form submission error:", error);
      // Define the projectIdNum variable for this block too
      const errorProjectIdNum = typeof projectId === 'string' ? parseInt(projectId) : projectId;
      
      toast({
        title: "Error",
        description: `Failed to ${(errorProjectIdNum && !isNaN(errorProjectIdNum) && errorProjectIdNum > 0) ? "update" : "add"} project. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <div className="flex items-center mb-6">
        <div className="mr-4 p-2 bg-blue-100 rounded-md">
          <ClipboardList className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {projectId && Number(projectId) > 0 ? "Edit Project" : "Add New Project"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {projectId && Number(projectId) > 0
              ? "Update the project details below."
              : "Fill out the project details below to add a new project to your dashboard."}
          </p>
        </div>
      </div>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name} {client.company ? `- ${client.company}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Website Copy Translation" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deadline</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                    value={field.value || ""} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <div className="relative rounded-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-7"
                      {...field}
                      value={field.value?.toString() || ""}
                      onChange={(e) => {
                        const value = e.target.value !== "" ? parseFloat(e.target.value) : undefined;
                        field.onChange(value);
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Project details..."
                  rows={3} 
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              if (onSuccess) onSuccess();
            }}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : projectId && Number(projectId) > 0 ? "Update Project" : "Add Project"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
