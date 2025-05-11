import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, ProjectLabelBadge, LanguagePairBadge } from "@/components/ui/status-badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DesignSystem() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="h1 mb-8">Freelanly Design System</h1>
      
      <section className="mb-10">
        <h2 className="h2 mb-4">Typography</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <h1 className="h1">Heading 1 (.h1)</h1>
                <p className="body-sm text-muted-foreground">2.25rem / 36px, Bold, -0.025em letter spacing</p>
              </div>
              
              <div>
                <h2 className="h2">Heading 2 (.h2)</h2>
                <p className="body-sm text-muted-foreground">1.875rem / 30px, Bold, -0.025em letter spacing</p>
              </div>
              
              <div>
                <h3 className="h3">Heading 3 (.h3)</h3>
                <p className="body-sm text-muted-foreground">1.5rem / 24px, Semibold, -0.025em letter spacing</p>
              </div>
              
              <div>
                <h4 className="h4">Heading 4 (.h4)</h4>
                <p className="body-sm text-muted-foreground">1.25rem / 20px, Semibold</p>
              </div>
              
              <div>
                <h5 className="h5">Heading 5 (.h5)</h5>
                <p className="body-sm text-muted-foreground">1.125rem / 18px, Semibold</p>
              </div>
              
              <div>
                <h6 className="h6">Heading 6 (.h6)</h6>
                <p className="body-sm text-muted-foreground">1rem / 16px, Semibold</p>
              </div>
              
              <div>
                <p className="body-lg">Body Large (.body-lg)</p>
                <p className="body-sm text-muted-foreground">1.125rem / 18px, Normal</p>
              </div>
              
              <div>
                <p className="body-base">Body Base (.body-base)</p>
                <p className="body-sm text-muted-foreground">1rem / 16px, Normal</p>
              </div>
              
              <div>
                <p className="body-sm">Body Small (.body-sm)</p>
                <p className="body-xs text-muted-foreground">0.875rem / 14px, Normal</p>
              </div>
              
              <div>
                <p className="body-xs">Body Extra Small (.body-xs)</p>
                <p className="body-xs text-muted-foreground">0.75rem / 12px, Normal</p>
              </div>
              
              <div>
                <p className="lead">Lead Text (.lead)</p>
                <p className="body-xs text-muted-foreground">1.25rem / 20px, Normal, Muted color</p>
              </div>
              
              <div>
                <p className="overline">Overline Text (.overline)</p>
                <p className="body-xs text-muted-foreground">0.75rem / 12px, Medium, Uppercase, 0.05em letter spacing</p>
              </div>
              
              <div>
                <p className="caption">Caption Text (.caption)</p>
                <p className="body-xs text-muted-foreground">0.75rem / 12px, Normal, Muted color</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
      
      <section className="mb-10">
        <h2 className="h2 mb-4">Colors</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-3">
                <div className="h-16 rounded-md bg-primary"></div>
                <p className="body-base font-medium">Primary</p>
                <p className="body-xs text-muted-foreground">Professional blue for main elements</p>
              </div>
              
              <div className="space-y-3">
                <div className="h-16 rounded-md bg-secondary"></div>
                <p className="body-base font-medium">Secondary</p>
                <p className="body-xs text-muted-foreground">Success green for confirmations</p>
              </div>
              
              <div className="space-y-3">
                <div className="h-16 rounded-md bg-accent"></div>
                <p className="body-base font-medium">Accent</p>
                <p className="body-xs text-muted-foreground">Purple for highlights</p>
              </div>
              
              <div className="space-y-3">
                <div className="h-16 rounded-md bg-destructive"></div>
                <p className="body-base font-medium">Destructive</p>
                <p className="body-xs text-muted-foreground">Red for errors/destructive actions</p>
              </div>
              
              <div className="space-y-3">
                <div className="h-16 rounded-md bg-[hsl(var(--warning))]"></div>
                <p className="body-base font-medium">Warning</p>
                <p className="body-xs text-muted-foreground">Orange for warnings</p>
              </div>
              
              <div className="space-y-3">
                <div className="h-16 rounded-md bg-muted"></div>
                <p className="body-base font-medium">Muted</p>
                <p className="body-xs text-muted-foreground">For subtle backgrounds</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
      
      <section className="mb-10">
        <h2 className="h2 mb-4">Status Colors</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-3">
                <div className="h-16 rounded-md bg-[hsl(var(--status-new))]"></div>
                <p className="body-base font-medium">New/Pending</p>
                <p className="body-xs text-muted-foreground">Light blue for new items</p>
              </div>
              
              <div className="space-y-3">
                <div className="h-16 rounded-md bg-[hsl(var(--status-in-progress))]"></div>
                <p className="body-base font-medium">In Progress</p>
                <p className="body-xs text-muted-foreground">Light yellow for items in progress</p>
              </div>
              
              <div className="space-y-3">
                <div className="h-16 rounded-md bg-[hsl(var(--status-paid))]"></div>
                <p className="body-base font-medium">Paid</p>
                <p className="body-xs text-muted-foreground">Light green for paid items</p>
              </div>
              
              <div className="space-y-3">
                <div className="h-16 rounded-md bg-[hsl(var(--status-completed))]"></div>
                <p className="body-base font-medium">Completed</p>
                <p className="body-xs text-muted-foreground">Light purple for completed items</p>
              </div>
              
              <div className="space-y-3">
                <div className="h-16 rounded-md bg-[hsl(var(--status-overdue))]"></div>
                <p className="body-base font-medium">Overdue</p>
                <p className="body-xs text-muted-foreground">Light red for overdue items</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
      
      <section className="mb-10">
        <h2 className="h2 mb-4">Components</h2>
        
        <h3 className="h3 mb-4 mt-6">Buttons</h3>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <Button variant="default">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </CardContent>
        </Card>
        
        <h3 className="h3 mb-4 mt-6">Status Badges</h3>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <StatusBadge status="In Progress" />
              <StatusBadge status="Delivered" />
              <StatusBadge status="Paid" />
            </div>
            
            <div className="mt-6 flex flex-wrap gap-4">
              <ProjectLabelBadge label="In Progress" />
              <ProjectLabelBadge label="Overdue" />
              <ProjectLabelBadge label="Pending payment" />
              <ProjectLabelBadge label="Paid" />
              <ProjectLabelBadge label="Invoice sent" />
              <ProjectLabelBadge label="To be delivered" />
              <ProjectLabelBadge label="Make invoice" />
            </div>
            
            <div className="mt-6 flex flex-wrap gap-4">
              <LanguagePairBadge sourceLang="English" targetLang="German" />
              <LanguagePairBadge sourceLang="Spanish" targetLang="French" />
            </div>
          </CardContent>
        </Card>
        
        <h3 className="h3 mb-4 mt-6">Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card Description</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Card content goes here. This is a basic card example.</p>
            </CardContent>
            <CardFooter>
              <Button>Action</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>Profile Card</CardTitle>
                <CardDescription>With avatar</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p>This card includes an avatar in the header section.</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button>Save</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Project Card</CardTitle>
              <CardDescription>Translation project example</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <p className="body-sm text-muted-foreground">Client:</p>
                  <p className="body-sm font-medium">Jane Cooper</p>
                </div>
                <div className="flex justify-between">
                  <p className="body-sm text-muted-foreground">Status:</p>
                  <StatusBadge status="In Progress" />
                </div>
                <div className="flex justify-between">
                  <p className="body-sm text-muted-foreground">Languages:</p>
                  <LanguagePairBadge sourceLang="English" targetLang="Spanish" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">View Details</Button>
            </CardFooter>
          </Card>
        </div>
        
        <h3 className="h3 mb-4 mt-6">Form Elements</h3>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Enter your name" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
              </div>
              
              <div>
                <Tabs defaultValue="account">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                  </TabsList>
                  <TabsContent value="account" className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" placeholder="Enter username" />
                    </div>
                  </TabsContent>
                  <TabsContent value="password" className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" placeholder="Enter password" />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}