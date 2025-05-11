import { useState, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
// Removed unused tabs imports that were causing console errors
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
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

// Password change schema
const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, "Password must be at least 6 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match",
  path: ["confirmPassword"],
});


type ProfileFormValues = z.infer<typeof profileFormSchema>;
type BusinessFormValues = z.infer<typeof businessFormSchema>;
type NotificationFormValues = z.infer<typeof notificationFormSchema>;
type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function Settings() {
  const { toast } = useToast();
  const { user, deleteAccountMutation, changePasswordMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);
  
  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      bio: "",
      website: "",
      jobTitle: "",
    },
  });
  
  // Update form values when user data is loaded
  useEffect(() => {
    if (user) {
      profileForm.setValue("name", user.fullName || "");
      profileForm.setValue("email", user.email);
    }
  }, [user, profileForm]);

  // Business form
  const businessForm = useForm<BusinessFormValues>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      businessName: "",
      taxId: "",
      address: "",
      vatRate: "",
      defaultCurrency: "",
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
      invoicePrefix: "",
      paymentTerms: "", // Empty by default
      defaultNotes: "",
      latePaymentFee: "",
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
  
  const onPasswordSubmit = (data: PasswordFormValues) => {
    changePasswordMutation.mutate(
      { 
        currentPassword: data.currentPassword, 
        newPassword: data.newPassword 
      },
      {
        onSuccess: () => {
          setIsPasswordDialogOpen(false);
          passwordForm.reset();
        }
      }
    );
  };



  // Password change dialog
  const renderPasswordDialog = () => {
    return (
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and a new password to update your credentials.
            </DialogDescription>
          </DialogHeader>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsPasswordDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending ? (
                    <>Changing Password...</>
                  ) : (
                    <>Change Password</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
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
                    

                  </div>
                  
                  <Button type="submit">Save Invoice Settings</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        );
        
      case "account":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account security and account deletion options.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h3 className="text-lg font-medium">Account Security</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  You can change your password and update security settings here.
                </p>
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    className="mr-2"
                    onClick={() => setIsPasswordDialogOpen(true)}
                  >
                    Change Password
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Once you delete your account, all of your data will be permanently removed. This action cannot be undone.
                </p>
                
                <div className="mt-6 p-4 border border-destructive/20 bg-destructive/5 rounded-md">
                  <h4 className="font-medium text-destructive">Delete My Account</h4>
                  <p className="text-sm mt-2 mb-4">
                    This will permanently delete your account and all associated data including clients, projects, invoices, and documents.
                  </p>
                  
                  <AlertDialog open={isDeleteAccountDialogOpen} onOpenChange={setIsDeleteAccountDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive"
                        disabled={deleteAccountMutation.isPending}
                      >
                        {deleteAccountMutation.isPending ? "Deleting..." : "Delete My Account"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete your account and all associated data including clients, projects, invoices, and documents.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            deleteAccountMutation.mutate();
                            setIsDeleteAccountDialogOpen(false);
                          }}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderPasswordDialog()}
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
              className={`flex items-center justify-start px-3 py-2 text-sm ${activeTab === "account" ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50"} rounded-md transition-colors`}
              onClick={() => setActiveTab("account")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Account
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