import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TabsContent } from "@/components/ui/tabs";
import { 
    CreditCard, 
    DollarSign, 
    Gift, 
    Clock, 
    Users, 
    Star,
    Ticket,
    Calendar,
    AlertCircle,
    CheckCircle,
    Info
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function TicketPriceView({ event }) {
    const navigate = useNavigate();

    const handleRegister = () => {
        navigate(`/user/event-form/${event.id}`);
    };

    // Mock ticket tiers - replace with actual data from event.tickets or event.pricing
    const ticketTiers = event.tickets || event.pricing || [];

    // Format currency
    const formatPrice = (price) => {
        if (price === 0 || price === "0") return "Free";
        return `$${typeof price === 'number' ? price.toFixed(2) : price}`;
    };

    // Get tier color based on type
    const getTierColor = (type) => {
        switch (type?.toLowerCase()) {
            case 'early':
            case 'earlybird':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'regular':
            case 'standard':
                return 'bg-blue-50 border-blue-200 text-blue-800';
            case 'vip':
            case 'premium':
                return 'bg-purple-50 border-purple-200 text-purple-800';
            case 'student':
            case 'discount':
                return 'bg-orange-50 border-orange-200 text-orange-800';
            default:
                return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    };

    const getTierIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'early':
            case 'earlybird':
                return <Clock className="w-5 h-5 text-green-600" />;
            case 'regular':
            case 'standard':
                return <Ticket className="w-5 h-5 text-blue-600" />;
            case 'vip':
            case 'premium':
                return <Star className="w-5 h-5 text-purple-600" />;
            case 'student':
            case 'discount':
                return <Users className="w-5 h-5 text-orange-600" />;
            default:
                return <CreditCard className="w-5 h-5 text-gray-600" />;
        }
    };

    return (
        <TabsContent value="ticket-price">
            <div className="space-y-6">
                {!event.is_payment_required ? (
                    // Free Event Display
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Gift className="w-5 h-5 text-green-600" />
                                <h2 className="text-[16px] font-semibold">Free Event</h2>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Gift className="w-10 h-10 text-green-600" />
                                </div>
                                <h3 className="text-[18px] font-bold text-green-800 mb-2">
                                    No Cost to Join!
                                </h3>
                                <p className="text-[14px] text-muted-foreground mb-6 max-w-md mx-auto">
                                    This event is completely free to attend. Simply register to secure your spot
                                    and join us for an amazing experience.
                                </p>
                                <Button 
                                    onClick={handleRegister}
                                    className="bg-green-600 hover:bg-green-700 text-white px-8"
                                >
                                    <Ticket className="w-4 h-4 mr-2" />
                                    Register for Free
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    // Paid Event Display
                    <>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-primary" />
                                    <h2 className="text-[16px] font-semibold">Ticket Options</h2>
                                </div>
                                <p className="text-[13px] text-muted-foreground">
                                    Choose the ticket that best fits your needs and budget.
                                </p>
                            </CardHeader>
                            <CardContent>
                                {(!ticketTiers || ticketTiers.length === 0) ? (
                                    // Default pricing display when no specific tiers are available
                                    <div className="space-y-4">
                                        <div className="border rounded-lg p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <Ticket className="w-6 h-6 text-primary" />
                                                    <div>
                                                        <h3 className="text-[16px] font-semibold">General Admission</h3>
                                                        <p className="text-[13px] text-muted-foreground">
                                                            Access to all event activities
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[20px] font-bold text-primary">
                                                        {event.price ? formatPrice(event.price) : "Contact Organizer"}
                                                    </div>
                                                    <div className="text-[12px] text-muted-foreground">per person</div>
                                                </div>
                                            </div>
                                            <Separator className="mb-4" />
                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center gap-2 text-[13px]">
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                    <span>Full event access</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[13px]">
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                    <span>All materials included</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[13px]">
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                    <span>Certificate of participation</span>
                                                </div>
                                            </div>
                                            <Button 
                                                onClick={handleRegister}
                                                className="w-full bg-primary hover:bg-primary/90"
                                            >
                                                Select This Ticket
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    // Multiple ticket tiers display
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {ticketTiers.map((tier, index) => (
                                            <div
                                                key={index}
                                                className={`border-2 rounded-lg p-6 ${getTierColor(tier.type)} ${
                                                    tier.popular ? 'ring-2 ring-primary ring-opacity-50' : ''
                                                }`}
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        {getTierIcon(tier.type)}
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="text-[16px] font-semibold capitalize">
                                                                    {tier.name || tier.type}
                                                                </h3>
                                                                {tier.popular && (
                                                                    <Badge className="bg-primary text-primary-foreground text-xs">
                                                                        Popular
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            {tier.deadline && (
                                                                <div className="flex items-center gap-1 mt-1">
                                                                    <Calendar className="w-3 h-3" />
                                                                    <span className="text-[12px]">
                                                                        Until {new Date(tier.deadline).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-[18px] font-bold">
                                                            {formatPrice(tier.price)}
                                                        </div>
                                                        {tier.originalPrice && tier.originalPrice > tier.price && (
                                                            <div className="text-[12px] text-muted-foreground line-through">
                                                                {formatPrice(tier.originalPrice)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <p className="text-[13px] text-muted-foreground mb-4">
                                                    {tier.description || "Standard event access with all basic features included."}
                                                </p>

                                                {tier.features && tier.features.length > 0 && (
                                                    <>
                                                        <Separator className="mb-3" />
                                                        <div className="space-y-2 mb-4">
                                                            {tier.features.map((feature, idx) => (
                                                                <div key={idx} className="flex items-center gap-2 text-[13px]">
                                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                                    <span>{feature}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </>
                                                )}

                                                <Button 
                                                    onClick={handleRegister}
                                                    className="w-full"
                                                    variant={tier.popular ? "default" : "outline"}
                                                >
                                                    Select {tier.name || tier.type}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Payment Information */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Info className="w-5 h-5 text-blue-600" />
                                    <h3 className="text-[16px] font-semibold">Payment Information</h3>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 text-[13px]">
                                    <div className="flex items-start gap-2">
                                        <CreditCard className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <p>
                                            We accept all major credit cards and secure online payment methods.
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <p>
                                            All prices are in USD and include applicable taxes and fees.
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                        <p>
                                            Your payment is secured with industry-standard encryption.
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Clock className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                                        <p>
                                            Registration confirmation will be sent immediately after payment.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </TabsContent>
        )
    }