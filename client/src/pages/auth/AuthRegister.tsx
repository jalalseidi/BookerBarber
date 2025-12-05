import { useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/useToast"
import {
  UserPlus,
  User,
  Scissors,
  ArrowLeft,
  Mail,
  Lock,
  Phone,
  MapPin
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

type CustomerRegisterForm = {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phone: string
}

type BarberRegisterForm = {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phone: string
  specialties: string
  bio: string
  experience: string
}

type UserRole = "customer" | "barber"

export function AuthRegister() {
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>("customer")
  const { toast } = useToast()
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  
  const customerForm = useForm<CustomerRegisterForm>()
  const barberForm = useForm<BarberRegisterForm>()

  const onSubmitCustomer = async (data: CustomerRegisterForm) => {
    if (data.password !== data.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match",
      })
      return
    }

    try {
      setLoading(true)
      await registerUser(data.email, data.password, "customer", {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      });
      toast({
        title: "Success",
        description: "Account created successfully! Please sign in.",
      })
      navigate("/auth/login")
    } catch (error) {
      console.log("Register error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error)?.message || "Registration failed",
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmitBarber = async (data: BarberRegisterForm) => {
    if (data.password !== data.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match",
      })
      return
    }

    try {
      setLoading(true)
      await registerUser(data.email, data.password, "barber", {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        specialties: data.specialties,
        bio: data.bio,
        experience: data.experience,
      });
      toast({
        title: "Success",
        description: "Barber account created successfully! Please sign in.",
      })
      navigate("/auth/login")
    } catch (error) {
      console.log("Register error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error)?.message || "Registration failed",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back to Landing */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Scissors className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">StyleCraft</h1>
          </div>
          <p className="text-muted-foreground">Create your account to get started.</p>
        </div>

        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              Choose your account type and fill in your details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Role Selection */}
            <Tabs value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="customer" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer
                </TabsTrigger>
                <TabsTrigger value="barber" className="flex items-center gap-2">
                  <Scissors className="h-4 w-4" />
                  Barber
                </TabsTrigger>
              </TabsList>

              {/* Customer Registration */}
              <TabsContent value="customer" className="space-y-4">
                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-900/50">
                  <User className="h-4 w-4" />
                  <AlertDescription>
                    Register as a customer to book appointments with our professional barbers.
                  </AlertDescription>
                </Alert>

                <form onSubmit={customerForm.handleSubmit(onSubmitCustomer)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customer-firstName">First Name</Label>
                      <Input
                        id="customer-firstName"
                        placeholder="John"
                        {...customerForm.register("firstName", { required: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customer-lastName">Last Name</Label>
                      <Input
                        id="customer-lastName"
                        placeholder="Doe"
                        {...customerForm.register("lastName", { required: true })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customer-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="customer-email"
                        type="email"
                        placeholder="john@example.com"
                        className="pl-10"
                        {...customerForm.register("email", { required: true })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer-phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="customer-phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        className="pl-10"
                        {...customerForm.register("phone", { required: true })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="customer-password"
                        type="password"
                        placeholder="Enter password"
                        className="pl-10"
                        {...customerForm.register("password", { required: true })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer-confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="customer-confirmPassword"
                        type="password"
                        placeholder="Confirm password"
                        className="pl-10"
                        {...customerForm.register("confirmPassword", { required: true })}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      "Creating Account..."
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create Customer Account
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Barber Registration */}
              <TabsContent value="barber" className="space-y-4">
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900/50">
                  <Scissors className="h-4 w-4" />
                  <AlertDescription>
                    Register as a barber to manage your schedule and serve customers.
                  </AlertDescription>
                </Alert>

                <form onSubmit={barberForm.handleSubmit(onSubmitBarber)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="barber-firstName">First Name</Label>
                      <Input
                        id="barber-firstName"
                        placeholder="John"
                        {...barberForm.register("firstName", { required: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="barber-lastName">Last Name</Label>
                      <Input
                        id="barber-lastName"
                        placeholder="Doe"
                        {...barberForm.register("lastName", { required: true })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="barber-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="barber-email"
                        type="email"
                        placeholder="john@example.com"
                        className="pl-10"
                        {...barberForm.register("email", { required: true })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="barber-phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="barber-phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        className="pl-10"
                        {...barberForm.register("phone", { required: true })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="barber-specialties">Specialties</Label>
                    <Input
                      id="barber-specialties"
                      placeholder="e.g., Haircuts, Beard trimming, Hot shaves"
                      {...barberForm.register("specialties", { required: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="barber-experience">Years of Experience</Label>
                    <Input
                      id="barber-experience"
                      placeholder="e.g., 5 years"
                      {...barberForm.register("experience", { required: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="barber-bio">Bio</Label>
                    <Textarea
                      id="barber-bio"
                      placeholder="Tell customers about yourself and your expertise..."
                      className="min-h-[80px]"
                      {...barberForm.register("bio", { required: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="barber-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="barber-password"
                        type="password"
                        placeholder="Enter password"
                        className="pl-10"
                        {...barberForm.register("password", { required: true })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="barber-confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="barber-confirmPassword"
                        type="password"
                        placeholder="Confirm password"
                        className="pl-10"
                        {...barberForm.register("confirmPassword", { required: true })}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      "Creating Account..."
                    ) : (
                      <>
                        <Scissors className="mr-2 h-4 w-4" />
                        Create Barber Account
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              variant="link"
              className="text-sm text-muted-foreground"
              onClick={() => navigate("/auth/login")}
            >
              Already have an account? Sign in
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
