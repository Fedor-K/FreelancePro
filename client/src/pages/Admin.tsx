import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Trash2, Ban, UserCheck, DollarSign, Users, Briefcase, FileText } from "lucide-react";

// User type
type User = {
  id: number;
  username: string;
  email: string;
  fullName: string | null;
  isAdmin: boolean;
  isBlocked: boolean;
  createdAt: string;
};

// Summary type
type AdminSummary = {
  totalUsers: number;
  totalClients: number;
  totalProjects: number;
  projectsInProgress: number;
  projectsDelivered: number;
  projectsPaid: number;
  totalEarnings: number;
  mostActiveUser: {
    id: number;
    username: string;
    email: string;
    fullName: string | null;
    projectCount: number;
  } | null;
};

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Redirect to home if not admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      window.location.href = "/dashboard";
    }
  }, [user]);

  // Fetch users
  const { 
    data: users = [], 
    isLoading: isLoadingUsers,
    refetch: refetchUsers
  } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: !!user?.isAdmin,
  });

  // Fetch summary
  const { 
    data: summary, 
    isLoading: isLoadingSummary 
  } = useQuery<AdminSummary>({
    queryKey: ['/api/admin/summary'],
    enabled: !!user?.isAdmin,
  });

  // Toggle user blocked status
  const blockUserMutation = useMutation({
    mutationFn: async ({ userId, isBlocked }: { userId: number, isBlocked: boolean }) => {
      return apiRequest(`/api/admin/users/${userId}/block`, {
        method: 'PATCH',
        data: { isBlocked }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Usuario actualizado",
        description: "El estado del usuario ha sido actualizado exitosamente."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del usuario.",
        variant: "destructive"
      });
    }
  });

  // Delete user
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setIsDeleteDialogOpen(false);
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado exitosamente."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario.",
        variant: "destructive"
      });
    }
  });

  const handleBlockToggle = (user: User) => {
    blockUserMutation.mutate({ 
      userId: user.id, 
      isBlocked: !user.isBlocked 
    });
  };

  const confirmDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteUser = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  if (!user?.isAdmin) {
    return null; // Don't render anything if not admin
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="mb-4">
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="summary">Resumen</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>
                Ver, bloquear o eliminar usuarios del sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? (
                <div className="flex justify-center items-center h-40">
                  <span className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Nombre Completo</TableHead>
                        <TableHead>Admin</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            No hay usuarios en el sistema.
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user: User) => (
                          <TableRow key={user.id}>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.fullName || '-'}</TableCell>
                            <TableCell>
                              {user.isAdmin ? (
                                <Badge className="bg-primary">Admin</Badge>
                              ) : (
                                "No"
                              )}
                            </TableCell>
                            <TableCell>
                              {user.isBlocked ? (
                                <Badge variant="destructive">Bloqueado</Badge>
                              ) : (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Activo
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleBlockToggle(user)}
                                  disabled={blockUserMutation.isPending}
                                >
                                  {user.isBlocked ? (
                                    <UserCheck className="h-4 w-4 mr-1" />
                                  ) : (
                                    <Ban className="h-4 w-4 mr-1" />
                                  )}
                                  {user.isBlocked ? "Desbloquear" : "Bloquear"}
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => confirmDelete(user)}
                                  disabled={deleteUserMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Eliminar
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de la Plataforma</CardTitle>
              <CardDescription>
                Estadísticas y métricas generales del sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSummary ? (
                <div className="flex justify-center items-center h-40">
                  <span className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></span>
                </div>
              ) : summary ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-card">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-full">
                          <Users className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <div className="text-xl font-bold">{summary.totalUsers}</div>
                          <div className="text-sm text-muted-foreground">Usuarios</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-card">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-full">
                          <Briefcase className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <div className="text-xl font-bold">{summary.totalProjects}</div>
                          <div className="text-sm text-muted-foreground">Proyectos</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-card">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-full">
                          <DollarSign className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <div className="text-xl font-bold">${summary.totalEarnings.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">Ingresos Totales</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="md:col-span-3">
                    <CardHeader>
                      <CardTitle>Detalles de Proyectos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground text-sm">En Progreso</span>
                          <span className="text-xl font-semibold">{summary.projectsInProgress}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground text-sm">Entregados</span>
                          <span className="text-xl font-semibold">{summary.projectsDelivered}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground text-sm">Pagados</span>
                          <span className="text-xl font-semibold">{summary.projectsPaid}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {summary.mostActiveUser && (
                    <Card className="md:col-span-3">
                      <CardHeader>
                        <CardTitle>Usuario Más Activo</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <div className="text-xl font-semibold">
                              {summary.mostActiveUser.fullName || summary.mostActiveUser.username}
                            </div>
                            <div className="text-muted-foreground">{summary.mostActiveUser.email}</div>
                          </div>
                          <div className="mt-4 md:mt-0">
                            <Badge variant="outline" className="text-lg px-3 py-1">
                              <FileText className="h-4 w-4 mr-1 inline" />
                              {summary.mostActiveUser.projectCount} Proyectos
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">No se pudieron cargar los datos.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará al usuario{" "}
              <span className="font-semibold">{selectedUser?.username}</span> y todos sus datos
              relacionados (clientes, proyectos, documentos). Esta acción no
              se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteUser}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}