import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  ShoppingCart, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Package, 
  RotateCcw,
  Eye,
  User,
  CreditCard,
  MapPin
} from 'lucide-react';

interface Order {
  id: string;
  user_id: string;
  total_usd: number;
  total_bs: number;
  exchange_rate: number;
  payment_method_id: string;
  shipping_address: any;
  notes: string;
  estado_pedido: string;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
  payment_receipts: PaymentReceipt[];
  payment_methods: PaymentMethod;
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  products: Product;
}

interface Product {
  id: string;
  name: string;
  image_url: string;
  price: number;
}

interface PaymentReceipt {
  id: string;
  holder_name: string;
  holder_phone: string;
  holder_cedula: string;
  bank_used: string;
  amount_paid: number;
  reference_number: string;
  receipt_image_url: string;
  status: string;
  created_at: string;
  admin_notes?: string;
  payment_method_id: string;
  order_id: string;
  reviewed_at?: string;
  reviewed_by?: string;
  user_id: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  bank_name: string;
}

export const OrdersManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Cargar pedidos desde la base de datos
  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('Cargando pedidos...');

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (id, name, image_url, price)
          ),
          payment_receipts (*),
          payment_methods (id, name, type, bank_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error al cargar pedidos:', error);
        throw error;
      }

      console.log('Pedidos cargados:', data);
      setOrders(data || []);
    } catch (error: any) {
      console.error('Error completo al cargar pedidos:', error);
      toast.error('Error al cargar pedidos: ' + (error?.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Cambiar estado del pedido
  const updateOrderStatus = async (orderId: string, newStatus: string, adminNotes?: string) => {
    setActionLoading(orderId);
    
    try {
      console.log('Actualizando estado del pedido:', orderId, 'a:', newStatus);

      const updateData: any = {
        estado_pedido: newStatus,
        updated_at: new Date().toISOString()
      };

      if (adminNotes) {
        updateData.notes = adminNotes;
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) {
        console.error('Error al actualizar estado:', error);
        throw error;
      }

      console.log('Estado actualizado exitosamente');
      toast.success(`Pedido ${newStatus.toLowerCase()} exitosamente`);
      fetchOrders(); // Recargar pedidos
    } catch (error: any) {
      console.error('Error completo al actualizar estado:', error);
      toast.error('Error al actualizar pedido: ' + (error?.message || 'Error desconocido'));
    } finally {
      setActionLoading(null);
    }
  };

  // Aprobar pedido
  const handleApproveOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'Aprobado');
  };

  // Rechazar pedido
  const handleRejectOrder = () => {
    if (!selectedOrder || !rejectReason.trim()) {
      toast.error('Debe especificar un motivo de rechazo');
      return;
    }

    updateOrderStatus(selectedOrder.id, 'Rechazado', rejectReason);
    setIsRejectModalOpen(false);
    setRejectReason('');
    setSelectedOrder(null);
  };

  // Marcar como despachado
  const handleMarkAsDispatched = (orderId: string) => {
    updateOrderStatus(orderId, 'Despachado');
  };

  // Marcar como entregado
  const handleMarkAsDelivered = (orderId: string) => {
    updateOrderStatus(orderId, 'Entregado');
  };

  // Recuperar pedido rechazado
  const handleRecoverOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'Pendiente de verificación');
  };

  // Abrir modal de detalles
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  // Abrir modal de rechazo
  const handleOpenRejectModal = (order: Order) => {
    setSelectedOrder(order);
    setIsRejectModalOpen(true);
  };

  // Filtrar pedidos por estado
  const getPendingOrders = () => orders.filter(order => order.estado_pedido === 'Pendiente de verificación');
  const getApprovedOrders = () => orders.filter(order => order.estado_pedido === 'Aprobado');
  const getDispatchedOrders = () => orders.filter(order => order.estado_pedido === 'Despachado');
  const getRejectedOrders = () => orders.filter(order => order.estado_pedido === 'Rechazado');
  const getDeliveredOrders = () => orders.filter(order => order.estado_pedido === 'Entregado');

  // Renderizar tabla de pedidos
  const renderOrdersTable = (ordersList: Order[], showActions: boolean = true, actionType: string = 'pending') => {
    if (ordersList.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold mb-2">No hay pedidos</h3>
          <p className="text-gray-600">No se encontraron pedidos en esta sección</p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID Pedido</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Total USD</TableHead>
            <TableHead>Total BS</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Productos</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ordersList.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-mono text-sm">
                {order.id.split('-')[0]}...
              </TableCell>
              <TableCell>
                {new Date(order.created_at).toLocaleDateString('es-ES')}
              </TableCell>
              <TableCell className="font-semibold">
                ${order.total_usd.toFixed(2)}
              </TableCell>
              <TableCell>
                Bs. {order.total_bs?.toFixed(2) || '0.00'}
              </TableCell>
              <TableCell>
                <Badge 
                  variant={
                    order.estado_pedido === 'Aprobado' ? 'default' :
                    order.estado_pedido === 'Rechazado' ? 'destructive' :
                    order.estado_pedido === 'Despachado' ? 'outline' :
                    order.estado_pedido === 'Entregado' ? 'secondary' :
                    'outline'
                  }
                >
                  {order.estado_pedido}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {order.order_items?.length || 0} producto(s)
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(order)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  {showActions && actionType === 'pending' && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApproveOrder(order.id)}
                        disabled={actionLoading === order.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleOpenRejectModal(order)}
                        disabled={actionLoading === order.id}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  
                  {showActions && actionType === 'approved' && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleMarkAsDispatched(order.id)}
                      disabled={actionLoading === order.id}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Truck className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {showActions && actionType === 'dispatched' && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleMarkAsDelivered(order.id)}
                      disabled={actionLoading === order.id}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      <Package className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {showActions && actionType === 'rejected' && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleRecoverOrder(order.id)}
                      disabled={actionLoading === order.id}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Cargando pedidos...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCart className="w-6 h-6" />
            <span>Gestión de Pedidos</span>
          </CardTitle>
          <CardDescription>
            Administra todos los pedidos y comprobantes de pago
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="pending">
                Pendientes ({getPendingOrders().length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Despacho ({getApprovedOrders().length})
              </TabsTrigger>
              <TabsTrigger value="dispatched">
                Despachados ({getDispatchedOrders().length})
              </TabsTrigger>
              <TabsTrigger value="delivered">
                Entregados ({getDeliveredOrders().length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rechazados ({getRejectedOrders().length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pedidos Pendientes de Verificación</CardTitle>
                  <CardDescription>
                    Pedidos que requieren revisión y aprobación del comprobante de pago
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderOrdersTable(getPendingOrders(), true, 'pending')}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="approved" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pedidos Listos para Despacho</CardTitle>
                  <CardDescription>
                    Pedidos aprobados que están listos para ser despachados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderOrdersTable(getApprovedOrders(), true, 'approved')}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dispatched" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pedidos Despachados</CardTitle>
                  <CardDescription>
                    Pedidos que han sido despachados y están en camino
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderOrdersTable(getDispatchedOrders(), true, 'dispatched')}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="delivered" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pedidos Entregados</CardTitle>
                  <CardDescription>
                    Pedidos que han sido entregados exitosamente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderOrdersTable(getDeliveredOrders(), false)}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rejected" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pedidos Rechazados</CardTitle>
                  <CardDescription>
                    Pedidos que fueron rechazados y pueden ser recuperados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderOrdersTable(getRejectedOrders(), true, 'rejected')}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal de detalles del pedido */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Pedido</DialogTitle>
            <DialogDescription>
              Información completa del pedido y comprobante de pago
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Información del pedido */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ShoppingCart className="w-5 h-5" />
                    <span>Información del Pedido</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>ID del Pedido</Label>
                    <p className="font-mono text-sm">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <Label>Estado</Label>
                    <Badge className="ml-2">{selectedOrder.estado_pedido}</Badge>
                  </div>
                  <div>
                    <Label>Total USD</Label>
                    <p className="font-semibold">${selectedOrder.total_usd.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label>Total BS</Label>
                    <p>Bs. {selectedOrder.total_bs?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div>
                    <Label>Fecha de Creación</Label>
                    <p>{new Date(selectedOrder.created_at).toLocaleString('es-ES')}</p>
                  </div>
                  <div>
                    <Label>Tasa de Cambio</Label>
                    <p>{selectedOrder.exchange_rate?.toFixed(2) || '0.00'} Bs/$</p>
                  </div>
                </CardContent>
              </Card>

              {/* Información de envío */}
              {selectedOrder.shipping_address && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5" />
                      <span>Información de Envío</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nombre Completo</Label>
                      <p>{selectedOrder.shipping_address.firstName} {selectedOrder.shipping_address.lastName}</p>
                    </div>
                    <div>
                      <Label>Teléfono</Label>
                      <p>{selectedOrder.shipping_address.phone}</p>
                    </div>
                    <div className="col-span-2">
                      <Label>Dirección</Label>
                      <p>{selectedOrder.shipping_address.address}</p>
                    </div>
                    <div>
                      <Label>Ciudad</Label>
                      <p>{selectedOrder.shipping_address.city}</p>
                    </div>
                    <div>
                      <Label>Estado</Label>
                      <p>{selectedOrder.shipping_address.state}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Productos del pedido */}
              <Card>
                <CardHeader>
                  <CardTitle>Productos Pedidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedOrder.order_items?.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <img
                          src={item.products?.image_url || '/placeholder.svg'}
                          alt={item.products?.name || 'Producto'}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.products?.name || 'Producto desconocido'}</h4>
                          <p className="text-sm text-gray-600">
                            Cantidad: {item.quantity} x ${item.unit_price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${item.total_price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Comprobante de pago */}
              {selectedOrder.payment_receipts && selectedOrder.payment_receipts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="w-5 h-5" />
                      <span>Comprobante de Pago</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedOrder.payment_receipts.map((receipt) => (
                      <div key={receipt.id} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Titular</Label>
                            <p>{receipt.holder_name}</p>
                          </div>
                          <div>
                            <Label>Cédula</Label>
                            <p>{receipt.holder_cedula}</p>
                          </div>
                          <div>
                            <Label>Teléfono</Label>
                            <p>{receipt.holder_phone}</p>
                          </div>
                          <div>
                            <Label>Banco</Label>
                            <p>{receipt.bank_used}</p>
                          </div>
                          <div>
                            <Label>Monto Pagado</Label>
                            <p className="font-semibold">${receipt.amount_paid.toFixed(2)}</p>
                          </div>
                          <div>
                            <Label>Referencia</Label>
                            <p className="font-mono">{receipt.reference_number}</p>
                          </div>
                        </div>
                        
                        {receipt.receipt_image_url && (
                          <div>
                            <Label>Comprobante</Label>
                            <div className="mt-2">
                              <img
                                src={receipt.receipt_image_url}
                                alt="Comprobante de pago"
                                className="max-w-md rounded-lg border"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Notas del pedido */}
              {selectedOrder.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notas del Pedido</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedOrder.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de rechazo */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Pedido</DialogTitle>
            <DialogDescription>
              Especifica el motivo del rechazo del pedido
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-reason">Motivo del Rechazo *</Label>
              <Textarea
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Especifica por qué se rechaza el pedido..."
                rows={4}
              />
            </div>
            
            <div className="flex space-x-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectReason('');
                  setSelectedOrder(null);
                }}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleRejectOrder}
                disabled={!rejectReason.trim()}
              >
                Rechazar Pedido
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
