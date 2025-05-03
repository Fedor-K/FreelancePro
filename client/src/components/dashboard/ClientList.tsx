import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ClientForm } from "@/components/clients/ClientForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight, Plus, UserPlus, ArrowRight } from "lucide-react";
import { Client } from "@shared/schema";

export function ClientList() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  // Get the most recent 3 clients
  const recentClients = clients.slice(0, 3);

  const handleSuccess = () => {
    setIsDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
  };

  // Generate avatar fallback from client name
  const getAvatarFallback = (name: string) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return <div>Loading clients...</div>;
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Clients</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <ClientForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <ul className="divide-y divide-gray-200">
          {recentClients.length > 0 ? (
            recentClients.map((client) => (
              <li key={client.id}>
                <Link href={`/clients/${client.id}`} className="block hover:bg-gray-50">
                  <div className="flex items-center px-4 py-4 sm:px-6">
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <Avatar>
                          <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=random`} alt={client.name} />
                          <AvatarFallback>{getAvatarFallback(client.name)}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0 px-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate">{client.name}</p>
                          <p className="mt-1 text-sm text-gray-500 truncate">{client.company || "Individual"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-5 flex-shrink-0">
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{client.email}</p>
                          <p className="mt-1 text-xs text-gray-500">{client.language || "N/A"}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))
          ) : (
            <li className="py-8 text-center text-gray-500">
              No clients found. Add a client to get started.
            </li>
          )}
        </ul>
      </Card>
      
      <div className="mt-4 text-right">
        <Link href="/clients" className="text-sm font-medium text-primary hover:text-blue-700 flex items-center justify-end">
          View all clients <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
