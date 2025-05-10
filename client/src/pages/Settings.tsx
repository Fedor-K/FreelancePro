import { useState, useEffect } from "react";
import { ResumeSettings, getResumeSettings, saveResumeSettings } from "@/lib/settingsService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import { useToast } from "@/hooks/use-toast";
import { 
  Settings as SettingsIcon, 
  User, 
  CreditCard, 
  Database,
  FileText
} from "lucide-react";

// Profile settings schema
const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  bio: z.string().max(500, { message: "Bio must not exceed 500 characters" }).optional(),
  website: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  jobTitle: z.string().optional(),
});

// Business settings schema
const businessFormSchema = z.object({
  businessName: z.string().min(2, { message: "Business name must be at least 2 characters" }),
  taxId: z.string().optional(),
  address: z.string().optional(),
  vatRate: z.string().optional(),
  defaultCurrency: z.string(),
});

// Notification settings schema
const notificationFormSchema = z.object({
  emailNotifications: z.boolean().default(true),
  newProject: z.boolean().default(true),
  projectDeadline: z.boolean().default(true),
  paymentReceived: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
  weeklyDigest: z.boolean().default(true),
});

// Invoice settings schema
const invoiceFormSchema = z.object({
  invoicePrefix: z.string().max(5, { message: "Prefix should not exceed 5 characters" }),
  paymentTerms: z.string().default("14"),
  defaultNotes: z.string().max(1000, { message: "Notes must not exceed 1000 characters" }).optional(),
  latePaymentFee: z.string().optional(),
  sendReminders: z.boolean().default(true),
});

// Resume settings schema
const resumeFormSchema = z.object({
  defaultTitle: z.string().min(2, { message: "Title must be at least 2 characters" }),
  skills: z.string().max(500, { message: "Skills must not exceed 500 characters" }),
  languages: z.string().max(200, { message: "Languages must not exceed 200 characters" }),
  education: z.string().max(500, { message: "Education must not exceed 500 characters" }),
  experience: z.string().max(1000, { message: "Experience must not exceed 1000 characters" }),
  defaultTemplate: z.string().default("professional"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type BusinessFormValues = z.infer<typeof businessFormSchema>;
type NotificationFormValues = z.infer<typeof notificationFormSchema>;
type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
type ResumeFormValues = z.infer<typeof resumeFormSchema>;

export default function Settings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "John Doe",
      email: "john@example.com",
      bio: "Freelance translator and editor with 5+ years of experience.",
      website: "https://johndoe.com",
      jobTitle: "Professional Translator",
    },
  });

  // Business form
  const businessForm = useForm<BusinessFormValues>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      businessName: "JD Translations",
      taxId: "123456789",
      address: "123 Main St, New York, NY 10001",
      vatRate: "0",
      defaultCurrency: "USD",
    },
  });

  // Notification form
  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: true,
      newProject: true,
      projectDeadline: true,
      paymentReceived: true,
      marketingEmails: false,
      weeklyDigest: true,
    },
  });

  // Invoice form
  const invoiceForm = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoicePrefix: "INV-",
      paymentTerms: "14",
      defaultNotes: "Thank you for your business!",
      latePaymentFee: "5",
      sendReminders: true,
    },
  });
  
  // Resume form
  const resumeForm = useForm<ResumeFormValues>({
    resolver: zodResolver(resumeFormSchema),
    defaultValues: {
      defaultTitle: "Professional Translator Resume",
      skills: "Translation, Editing, Proofreading, Content Writing, Localization",
      languages: "English (Native), French (Fluent), Spanish (Intermediate)",
      education: "BA in Linguistics, University of California, 2018",
      experience: "Freelance Translator (2018-Present)\n- Translated over 50 documents for various clients\n- Specialized in technical and marketing content",
      defaultTemplate: "professional",
    },
  });
  
  // Load resume settings on component mount
  useEffect(() => {
    const loadResumeSettings = async () => {
      try {
        const settings = await getResumeSettings();
        resumeForm.reset(settings);
      } catch (error) {
        console.error("Failed to load resume settings:", error);
      }
    };
    
    loadResumeSettings();
  }, [resumeForm]);

  // Form submit handlers
  const onProfileSubmit = (data: ProfileFormValues) => {
    toast({
      title: "Profile updated",
      description: "Your profile settings have been saved.",
    });
    console.log("Profile data:", data);
  };

  const onBusinessSubmit = (data: BusinessFormValues) => {
    toast({
      title: "Business settings updated",
      description: "Your business settings have been saved.",
    });
    console.log("Business data:", data);
  };

  const onNotificationSubmit = (data: NotificationFormValues) => {
    toast({
      title: "Notification preferences updated",
      description: "Your notification settings have been saved.",
    });
    console.log("Notification data:", data);
  };

  const onInvoiceSubmit = (data: InvoiceFormValues) => {
    toast({
      title: "Invoice settings updated",
      description: "Your invoice settings have been saved.",
    });
    console.log("Invoice data:", data);
  };

  const onResumeSubmit = async (data: ResumeFormValues) => {
    try {
      await saveResumeSettings(data);
      
      toast({
        title: "Resume settings updated",
        description: "Your resume settings have been saved and will be used in the Resume Builder.",
      });
    } catch (error) {
      console.error("Failed to save resume settings:", error);
      toast({
        title: "Error",
        description: "Failed to save resume settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Helper to render the setting tab content
  const renderTabContent = () => {
    switch(activeTab) {
      case "profile":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Update your personal information. This information will be displayed on your invoices and documents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is the name that will appear on your invoices and documents.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          This email will be used for notifications and account communications.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="jobTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Professional Translator" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your professional title or specialization.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://yourwebsite.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your professional website or portfolio.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell clients about your experience, skills, and specializations." 
                            className="h-32"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          A brief description of your professional experience and services.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit">Save Profile</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        );
        
      case "business":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Update your business details for billing and tax purposes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...businessForm}>
                <form onSubmit={businessForm.handleSubmit(onBusinessSubmit)} className="space-y-6">
                  <FormField
                    control={businessForm.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Business LLC" {...field} />
                        </FormControl>
                        <FormDescription>
                          The official name of your business.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={businessForm.control}
                    name="taxId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax ID / VAT Number</FormLabel>
                        <FormControl>
                          <Input placeholder="123456789" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your tax identification or VAT number.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={businessForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Address</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="123 Main St, City, Country" 
                            className="h-20"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Your business address for invoices and legal documents.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={businessForm.control}
                      name="defaultCurrency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Currency</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="USD">USD - US Dollar</SelectItem>
                              <SelectItem value="EUR">EUR - Euro</SelectItem>
                              <SelectItem value="GBP">GBP - British Pound</SelectItem>
                              <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                              <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                              <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The currency used for your invoices.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={businessForm.control}
                      name="vatRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>VAT/Tax Rate (%)</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a VAT rate" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">0% - No VAT</SelectItem>
                              <SelectItem value="5">5%</SelectItem>
                              <SelectItem value="10">10%</SelectItem>
                              <SelectItem value="15">15%</SelectItem>
                              <SelectItem value="20">20%</SelectItem>
                              <SelectItem value="25">25%</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Default VAT or tax rate for your invoices.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button type="submit">Save Business Information</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        );
        
      case "invoicing":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Invoice Settings</CardTitle>
              <CardDescription>
                Customize your invoice preferences and defaults.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...invoiceForm}>
                <form onSubmit={invoiceForm.handleSubmit(onInvoiceSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={invoiceForm.control}
                      name="invoicePrefix"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Invoice Number Prefix</FormLabel>
                          <FormControl>
                            <Input placeholder="INV-" {...field} />
                          </FormControl>
                          <FormDescription>
                            Prefix for your invoice numbers (e.g., INV-, ACME-)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={invoiceForm.control}
                      name="paymentTerms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Payment Terms (Days)</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment terms" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">Due on receipt</SelectItem>
                              <SelectItem value="7">Net 7</SelectItem>
                              <SelectItem value="14">Net 14</SelectItem>
                              <SelectItem value="30">Net 30</SelectItem>
                              <SelectItem value="60">Net 60</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Default payment due period for invoices.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={invoiceForm.control}
                    name="defaultNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Invoice Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter default text to appear on all invoices" 
                            className="h-20"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Standard notes that will appear on all invoices.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={invoiceForm.control}
                      name="latePaymentFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Late Payment Fee (%)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="5" {...field} />
                          </FormControl>
                          <FormDescription>
                            Percentage fee applied to late payments.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={invoiceForm.control}
                      name="sendReminders"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between space-x-3 h-full">
                          <div className="space-y-0.5">
                            <FormLabel>Automatic Payment Reminders</FormLabel>
                            <FormDescription>
                              Send automatic reminders for overdue invoices
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button type="submit">Save Invoice Settings</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        );
        
      case "resume":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Resume Settings</CardTitle>
              <CardDescription>
                Configure your default resume content and preferences for resume generation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...resumeForm}>
                <form onSubmit={resumeForm.handleSubmit(onResumeSubmit)} className="space-y-6">
                  <FormField
                    control={resumeForm.control}
                    name="defaultTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Resume Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Professional Translator Resume" {...field} />
                        </FormControl>
                        <FormDescription>
                          This title will be used as the default for new resumes.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={resumeForm.control}
                      name="skills"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Skills</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="List your professional skills, separated by commas" 
                              className="h-24"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            These skills will appear in your resume skills section.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={resumeForm.control}
                      name="languages"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Languages</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="List languages and proficiency levels" 
                              className="h-24"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Languages you speak and your proficiency levels.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={resumeForm.control}
                    name="education"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Education</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter your educational background" 
                            className="h-24"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Your educational history to include in resumes.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={resumeForm.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Experience</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter your work experience" 
                            className="h-32"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Your work history and achievements to include in resumes.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={resumeForm.control}
                    name="defaultTemplate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Resume Template</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a template" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="creative">Creative</SelectItem>
                            <SelectItem value="minimalist">Minimalist</SelectItem>
                            <SelectItem value="modern">Modern</SelectItem>
                            <SelectItem value="academic">Academic</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The default template style for your resume.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit">Save Resume Settings</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <SettingsIcon className="h-6 w-6 mr-2 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>
      
      <p className="text-muted-foreground">
        Manage your account settings and preferences.
      </p>
      
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-8 lg:space-y-0">
        {/* Sidebar Navigation */}
        <aside className="lg:w-1/5">
          <div className="flex flex-col h-auto items-stretch justify-start space-y-1">
            <button 
              className={`flex items-center justify-start px-3 py-2 text-sm ${activeTab === "profile" ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50"} rounded-md transition-colors`}
              onClick={() => setActiveTab("profile")}
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </button>
            <button 
              className={`flex items-center justify-start px-3 py-2 text-sm ${activeTab === "business" ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50"} rounded-md transition-colors`}
              onClick={() => setActiveTab("business")}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Business
            </button>
            <button 
              className={`flex items-center justify-start px-3 py-2 text-sm ${activeTab === "invoicing" ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50"} rounded-md transition-colors`}
              onClick={() => setActiveTab("invoicing")}
            >
              <Database className="h-4 w-4 mr-2" />
              Invoicing
            </button>
            <button 
              className={`flex items-center justify-start px-3 py-2 text-sm ${activeTab === "resume" ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50"} rounded-md transition-colors`}
              onClick={() => setActiveTab("resume")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Resume
            </button>
          </div>
        </aside>
        
        {/* Main Content Area */}
        <div className="flex-1 lg:max-w-3xl">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}