import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertClientSchema } from "@shared/schema";
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
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User } from "lucide-react";

// Extend the schema with validation
const formSchema = insertClientSchema.extend({
  email: z.string().email({ message: "Please enter a valid email address" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

interface ClientFormProps {
  defaultValues?: Partial<FormValues>;
  clientId?: number;
  onSuccess?: () => void;
}

export function ClientForm({ defaultValues, clientId, onSuccess }: ClientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Convert null values to empty strings for form fields
  const initialValues = {
    name: defaultValues?.name || "",
    email: defaultValues?.email || "",
    company: defaultValues?.company || "",
    language: defaultValues?.language || "",
    comments: defaultValues?.comments || "",
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      if (clientId) {
        // Update existing client
        await apiRequest("PATCH", `/api/clients/${clientId}`, data);
        toast({
          title: "Client updated",
          description: "Client has been updated successfully.",
        });
      } else {
        // Create new client
        await apiRequest("POST", "/api/clients", data);
        toast({
          title: "Client added",
          description: "New client has been added successfully.",
        });
      }
      
      // Invalidate and refetch clients
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset form if creating new client
      if (!clientId) {
        form.reset();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${clientId ? "update" : "add"} client. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <div className="flex items-center mb-6">
        <div className="mr-4 p-2 bg-primary bg-opacity-20 rounded-md">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {clientId ? "Edit Client" : "Add New Client"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {clientId
              ? "Update the client's information below."
              : "Fill in the details to add a new client to your list."}
          </p>
        </div>
      </div>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. John Smith" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="e.g. john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g. Acme Corporation (optional)" 
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>Leave blank if the client is an individual</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Languages</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g. English, Spanish (optional)" 
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>Languages the client communicates in or needs translation for</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comments</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add any notes or comments about this client (optional)" 
                  className="min-h-[100px]"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>Additional information, special requirements or notes</FormDescription>
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
            {isSubmitting ? "Saving..." : clientId ? "Update Client" : "Add Client"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
