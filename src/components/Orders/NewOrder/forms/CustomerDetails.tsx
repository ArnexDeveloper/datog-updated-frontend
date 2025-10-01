import React, { useState } from "react";
import axios from "axios";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../ui/tabs";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";

interface Customer {
  _id: string;
  name: string;
  phone: string;
  email: string;
  gender: string;
  address: string;
  totalOrders?: number;
  totalSpent?: number;
}

interface CustomerDetailsProps {
  formData?: any;
  handleInputChange?: (e: any) => void;
  onNext: (selectedCustomer?: Customer) => void;
  onCreateCustomer: (customerData: any) => Promise<Customer | null>;
}

export default function CustomerDetails({ onNext, onCreateCustomer }: CustomerDetailsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Separate states
  const initialCreateForm = {
    name: "",
    phone: "",
    email: "",
    gender: "",
    address: "",
  };
  const [createForm, setCreateForm] = useState(initialCreateForm);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchResults, setSearchResults] = useState<Customer[]>([]);

  // Tabs control
  const [activeTab, setActiveTab] = useState("search");

  const baseURL = import.meta.env.VITE_BASE_URL;

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setMessage("");

    if (value === "search") {
      setSearchQuery("");
      setSearchResults([]);
      setSelectedCustomer(null);
    }

    if (value === "create") {
      setCreateForm(initialCreateForm);
    }
  };

  // 🔍 Search customer API
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setMessage("");
      const res = await axios.get(`${baseURL}/customers/search`, {
        params: { q: searchQuery },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.data?.data?.length > 0) {
        const results = res.data.data;
        setSearchResults(results);
        if (results.length === 1) {
          handleSelectCustomer(results[0]);
          setMessage("✅ Customer found and selected automatically.");
        } else {
          setMessage(`✅ Found ${results.length} customers. Please select one.`);
          setSelectedCustomer(null);
        }
      } else {
        setMessage("⚠️ No customer found. Try again or create a new one.");
        setSearchResults([]);
        setSelectedCustomer(null);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Error searching customer.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCustomer = (cust: Customer) => {
    setSelectedCustomer(cust);
    setSearchResults([]);
    setMessage(`✅ ${cust.name} selected. You can click Next to continue.`);
  };

  // Input handler for create form
  const handleCreateInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  // Validation for create customer
  const validateCreateForm = () => {
    if (!createForm.name.trim()) {
      setMessage("⚠️ Full Name is required.");
      return false;
    }
    if (!createForm.phone.trim()) {
      setMessage("⚠️ Phone is required.");
      return false;
    }
    if (
      createForm.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email)
    ) {
      setMessage("⚠️ Invalid email format.");
      return false;
    }
    return true;
  };

  // Create customer
  const handleCreateCustomer = async () => {
    if (!validateCreateForm()) return;
    try {
      setLoading(true);
      const customer = await onCreateCustomer(createForm);
      if (customer) {
        setMessage("✅ Customer created successfully! Selected automatically.");
        setSelectedCustomer(customer);
        setActiveTab("search"); // go back to search tab with new customer
      }
    } catch (error) {
      console.error("Error creating customer:", error);
      setMessage("❌ Failed to create customer.");
    } finally {
      setLoading(false);
    }
  };

  console.log(selectedCustomer);

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold text-amber-900">Customer Information</h2>

      {/* Tabs for Search & Create */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-2 w-full mb-6">
          <TabsTrigger value="search" className="flex items-center gap-2">
            🔍 Search Customer
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            👤➕ Add New Customer
          </TabsTrigger>
        </TabsList>

        {/* Search Customer Tab */}
        <TabsContent value="search">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button
                onClick={handleSearch}
                disabled={loading || !searchQuery.trim()}
              >
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>

            {message && (
              <div className="text-sm text-muted-foreground">{message}</div>
            )}

            {/* List of Customers */}
            {searchResults.length > 0 && (
              <div className="space-y-3 mt-4">
                {searchResults.map((cust) => (
                  <div
                    key={cust._id}
                    className={`p-3 border rounded-lg shadow-sm ${
                      selectedCustomer?._id === cust._id
                        ? "bg-amber-100 border-amber-400"
                        : "bg-white hover:bg-amber-50 cursor-pointer"
                    }`}
                    onClick={() => handleSelectCustomer(cust)}
                  >
                    <p className="font-semibold">{cust.name}</p>
                    <p className="text-sm text-gray-600">{cust.phone}</p>
                    <p className="text-sm text-gray-600">{cust.email}</p>
                    <p className="text-xs text-gray-500">
                      Orders: {cust.totalOrders || 0} | Spent: ${cust.totalSpent || 0}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Customer Details */}
            {selectedCustomer && (
              <div className="space-y-3 border rounded-xl p-4 bg-white shadow-sm mt-4">
                <p className="font-semibold text-lg">
                  {selectedCustomer.name} ({selectedCustomer.phone})
                </p>
                <p className="text-sm text-gray-600">{selectedCustomer.email}</p>
                <p className="text-sm text-gray-600">Gender: {selectedCustomer.gender}</p>
                <p className="text-sm text-gray-600">
                  Address: {selectedCustomer.address}
                </p>

                <Button onClick={() => onNext(selectedCustomer)}>Next</Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Create New Customer Tab */}
        <TabsContent value="create">
          <div className="space-y-3 border rounded-xl p-4 bg-white shadow-sm">
            <div>
              <label className="block text-sm font-medium">Full Name *</label>
              <Input
                type="text"
                name="name"
                value={createForm.name}
                onChange={handleCreateInputChange}
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Phone *</label>
              <Input
                type="text"
                name="phone"
                value={createForm.phone}
                onChange={handleCreateInputChange}
                placeholder="+1 555 123 4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <Input
                type="email"
                name="email"
                value={createForm.email}
                onChange={handleCreateInputChange}
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Gender</label>
              <select
                name="gender"
                value={createForm.gender}
                onChange={handleCreateInputChange}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Address</label>
              <textarea
                name="address"
                value={createForm.address}
                onChange={handleCreateInputChange}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="123 Main St"
              />
            </div>
            <Button onClick={handleCreateCustomer} disabled={loading}>
              {loading ? "Creating..." : "Create Customer"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}