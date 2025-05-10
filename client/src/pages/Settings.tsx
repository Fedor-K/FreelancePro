import { useState } from "react";
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
  Bell, 
  Globe, 
  Lock, 
  Plug, 
  Palette,
  Database
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

// Integration settings schema
const integrationFormSchema = z.object({
  linkedInEnabled: z.boolean().default(false),
  googleCalendarEnabled: z.boolean().default(false),
  openAIEnabled: z.boolean().default(true),
  slackEnabled: z.boolean().default(false),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type BusinessFormValues = z.infer<typeof businessFormSchema>;
type NotificationFormValues = z.infer<typeof notificationFormSchema>;
type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
type IntegrationFormValues = z.infer<typeof integrationFormSchema>;

export default function Settings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [language, setLanguage] = useState("en-US");
  
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

  // Integration form
  const integrationForm = useForm<IntegrationFormValues>({
    resolver: zodResolver(integrationFormSchema),
    defaultValues: {
      linkedInEnabled: false,
      googleCalendarEnabled: false,
      openAIEnabled: true,
      slackEnabled: false,
    },
  });

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

  const onIntegrationSubmit = (data: IntegrationFormValues) => {
    toast({
      title: "Integration settings updated",
      description: "Your integration settings have been saved.",
    });
    console.log("Integration data:", data);
  };
  
  const onAppearanceSubmit = () => {
    toast({
      title: "Appearance settings updated",
      description: "Your appearance settings have been saved.",
    });
    console.log("Appearance data:", { theme, language });
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
        
      case "notifications":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                  <FormField
                    control={notificationForm.control}
                    name="emailNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Email Notifications</FormLabel>
                          <FormDescription>
                            Receive notifications via email
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
                  
                  <div className="border rounded-lg divide-y">
                    <FormField
                      control={notificationForm.control}
                      name="newProject"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">New Project Notifications</FormLabel>
                            <FormDescription>
                              Get notified when you receive a new project
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="projectDeadline"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Deadline Reminders</FormLabel>
                            <FormDescription>
                              Get notified about upcoming project deadlines
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="paymentReceived"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Payment Notifications</FormLabel>
                            <FormDescription>
                              Get notified when you receive a payment
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="weeklyDigest"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Weekly Summary</FormLabel>
                            <FormDescription>
                              Receive a weekly digest of your activity
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="marketingEmails"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Marketing Emails</FormLabel>
                            <FormDescription>
                              Receive tips, product updates, and offers
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button type="submit">Save Notification Preferences</Button>
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
        
      case "appearance":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the appearance of your dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Theme</h3>
                <p className="text-sm text-muted-foreground">
                  Select your preferred theme for the dashboard.
                </p>
                <div className="grid gap-2">
                  <RadioGroup 
                    defaultValue={theme} 
                    onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}
                    className="grid grid-cols-3 gap-4"
                  >
                    <div>
                      <RadioGroupItem
                        value="light"
                        id="theme-light"
                        className="sr-only"
                      />
                      <label
                        htmlFor="theme-light"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <div className="mb-2 rounded-md bg-white p-2">
                          <div className="h-5 w-5 rounded-full border border-sky-400 bg-sky-200" />
                        </div>
                        <span className="text-center text-sm font-medium">
                          Light
                        </span>
                      </label>
                    </div>
                    <div>
                      <RadioGroupItem
                        value="dark"
                        id="theme-dark"
                        className="sr-only"
                      />
                      <label
                        htmlFor="theme-dark"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <div className="mb-2 rounded-md bg-slate-950 p-2">
                          <div className="h-5 w-5 rounded-full border border-slate-800 bg-slate-700" />
                        </div>
                        <span className="text-center text-sm font-medium">
                          Dark
                        </span>
                      </label>
                    </div>
                    <div>
                      <RadioGroupItem
                        value="system"
                        id="theme-system"
                        className="sr-only"
                      />
                      <label
                        htmlFor="theme-system"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <div className="mb-2 rounded-md bg-background p-2">
                          <div className="h-5 w-5 rounded-full border border-slate-400 bg-gradient-to-br from-sky-200 to-slate-700" />
                        </div>
                        <span className="text-center text-sm font-medium">
                          System
                        </span>
                      </label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Language</h3>
                <p className="text-sm text-muted-foreground">
                  Select your preferred language.
                </p>
                <Select
                  defaultValue={language}
                  onValueChange={setLanguage}
                >
                  <SelectTrigger className="w-full max-w-xs">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="en-GB">English (UK)</SelectItem>
                    <SelectItem value="fr-FR">Français</SelectItem>
                    <SelectItem value="de-DE">Deutsch</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                    <SelectItem value="it-IT">Italiano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={onAppearanceSubmit}>Save Appearance Settings</Button>
            </CardContent>
          </Card>
        );
        
      case "integrations":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>
                Connect Freelanly with other services to enhance your workflow.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...integrationForm}>
                <form onSubmit={integrationForm.handleSubmit(onIntegrationSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <div className="border rounded-lg divide-y">
                      <FormField
                        control={integrationForm.control}
                        name="openAIEnabled"
                        render={({ field }) => (
                          <div className="flex items-center justify-between p-4">
                            <div className="flex items-center space-x-4">
                              <div className="bg-gradient-to-r from-green-400 to-blue-500 p-2 rounded-md">
                                <Lock className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h3 className="text-sm font-medium">OpenAI</h3>
                                <p className="text-sm text-muted-foreground">
                                  Powers AI document generation and editing
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                              <span className={field.value ? "text-green-500 text-xs font-medium" : "text-gray-400 text-xs"}>
                                {field.value ? "Connected" : "Disconnected"}
                              </span>
                            </div>
                          </div>
                        )}
                      />
                      
                      <FormField
                        control={integrationForm.control}
                        name="linkedInEnabled"
                        render={({ field }) => (
                          <div className="flex items-center justify-between p-4">
                            <div className="flex items-center space-x-4">
                              <div className="bg-blue-600 p-2 rounded-md">
                                <Globe className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h3 className="text-sm font-medium">LinkedIn</h3>
                                <p className="text-sm text-muted-foreground">
                                  Pull leads from job postings and networking opportunities
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                              <span className={field.value ? "text-green-500 text-xs font-medium" : "text-gray-400 text-xs"}>
                                {field.value ? "Connected" : "Disconnected"}
                              </span>
                            </div>
                          </div>
                        )}
                      />
                      
                      <FormField
                        control={integrationForm.control}
                        name="googleCalendarEnabled"
                        render={({ field }) => (
                          <div className="flex items-center justify-between p-4">
                            <div className="flex items-center space-x-4">
                              <div className="bg-red-500 p-2 rounded-md">
                                <Bell className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h3 className="text-sm font-medium">Google Calendar</h3>
                                <p className="text-sm text-muted-foreground">
                                  Sync deadlines and project milestones to your calendar
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                              <span className={field.value ? "text-green-500 text-xs font-medium" : "text-gray-400 text-xs"}>
                                {field.value ? "Connected" : "Disconnected"}
                              </span>
                            </div>
                          </div>
                        )}
                      />
                      
                      <FormField
                        control={integrationForm.control}
                        name="slackEnabled"
                        render={({ field }) => (
                          <div className="flex items-center justify-between p-4">
                            <div className="flex items-center space-x-4">
                              <div className="bg-purple-500 p-2 rounded-md">
                                <Plug className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h3 className="text-sm font-medium">Slack</h3>
                                <p className="text-sm text-muted-foreground">
                                  Receive notifications and updates in your Slack workspace
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                              <span className={field.value ? "text-green-500 text-xs font-medium" : "text-gray-400 text-xs"}>
                                {field.value ? "Connected" : "Disconnected"}
                              </span>
                            </div>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Button type="submit">Save Integration Settings</Button>
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
              className={`flex items-center justify-start px-3 py-2 text-sm ${activeTab === "notifications" ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50"} rounded-md transition-colors`}
              onClick={() => setActiveTab("notifications")}
            >
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </button>
            <button 
              className={`flex items-center justify-start px-3 py-2 text-sm ${activeTab === "invoicing" ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50"} rounded-md transition-colors`}
              onClick={() => setActiveTab("invoicing")}
            >
              <Database className="h-4 w-4 mr-2" />
              Invoicing
            </button>
            <button 
              className={`flex items-center justify-start px-3 py-2 text-sm ${activeTab === "appearance" ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50"} rounded-md transition-colors`}
              onClick={() => setActiveTab("appearance")}
            >
              <Palette className="h-4 w-4 mr-2" />
              Appearance
            </button>
            <button 
              className={`flex items-center justify-start px-3 py-2 text-sm ${activeTab === "integrations" ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50"} rounded-md transition-colors`}
              onClick={() => setActiveTab("integrations")}
            >
              <Plug className="h-4 w-4 mr-2" />
              Integrations
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