import { useState, useRef, useMemo } from "react";
import { Upload, Receipt, Users, X, ImageIcon, Loader2, UserPlus, Trash2, DollarSign, ChevronDown, Pencil, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { analyzeBillImage, BillData } from "@/services/gemini";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Person {
  id: string;
  name: string;
}

interface ItemAssignment {
  [itemId: string]: string[]; // itemId -> array of personIds
}

interface PersonTotal {
  personId: string;
  name: string;
  itemsSubtotal: number;
  tax: number;
  tip: number;
  total: number;
}

type AssignmentMode = "dropdown" | "checkboxes";

// Mock data for testing
const MOCK_BILL_DATA: BillData = {
  items: [
    { id: "item-1", name: "Super Burrito w/ Grilled Chicken", price: 18.00 },
    { id: "item-2", name: "Super Burrito w/ Grilled Chicken", price: 18.00 },
    { id: "item-3", name: "Mexican Omelette Country Potatoes Toasted SourDough", price: 17.00 },
    { id: "item-4", name: "Platanos Fritos w/ Lechera", price: 10.00 },
    { id: "item-5", name: "Veggie Omelette Country Potatoes", price: 15.00 },
    { id: "item-6", name: "Toasted Sub Pancake", price: 3.00 },
    { id: "item-7", name: "Waffles", price: 14.00 },
  ],
  subtotal: 95.00,
  tax: 8.91,
  tip: 0.00,
  total: 103.91,
};

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [billData, setBillData] = useState<BillData | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [newPersonName, setNewPersonName] = useState("");
  const [itemAssignments, setItemAssignments] = useState<ItemAssignment>({});
  const [assignmentMode, setAssignmentMode] = useState<AssignmentMode>("checkboxes");
  const [customTip, setCustomTip] = useState<string>("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemName, setEditingItemName] = useState<string>("");
  const [editingItemPrice, setEditingItemPrice] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
    const maxSize = 20 * 1024 * 1024; // 20MB

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, or HEIC image.",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 20MB.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = (file: File) => {
    if (!validateFile(file)) return;

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setBillData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStartOver = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setBillData(null);
    setPeople([]);
    setItemAssignments({});
    setCustomTip("");
    setEditingItemId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast({
      title: "Reset complete",
      description: "Starting fresh!",
    });
  };

  const handleEditItem = (itemId: string, itemName: string, itemPrice: number) => {
    setEditingItemId(itemId);
    setEditingItemName(itemName);
    setEditingItemPrice(itemPrice.toString());
  };

  const handleSaveItemEdit = () => {
    if (!billData || !editingItemId) return;

    const price = parseFloat(editingItemPrice);
    if (isNaN(price) || price < 0) {
      toast({
        title: "Invalid price",
        description: "Please enter a valid price.",
        variant: "destructive",
      });
      return;
    }

    if (!editingItemName.trim()) {
      toast({
        title: "Invalid name",
        description: "Item name cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    const updatedItems = billData.items.map(item =>
      item.id === editingItemId
        ? { ...item, name: editingItemName.trim(), price }
        : item
    );

    // Recalculate subtotal
    const newSubtotal = updatedItems.reduce((sum, item) => sum + item.price, 0);

    setBillData({
      ...billData,
      items: updatedItems,
      subtotal: newSubtotal,
      total: newSubtotal + billData.tax + (parseFloat(customTip) || billData.tip),
    });

    setEditingItemId(null);
    setEditingItemName("");
    setEditingItemPrice("");
  };

  const handleCancelItemEdit = () => {
    setEditingItemId(null);
    setEditingItemName("");
    setEditingItemPrice("");
  };

  const handleDeleteItem = (itemId: string) => {
    if (!billData) return;

    const updatedItems = billData.items.filter(item => item.id !== itemId);
    const newSubtotal = updatedItems.reduce((sum, item) => sum + item.price, 0);

    setBillData({
      ...billData,
      items: updatedItems,
      subtotal: newSubtotal,
      total: newSubtotal + billData.tax + (parseFloat(customTip) || billData.tip),
    });

    // Remove item from assignments
    const newAssignments = { ...itemAssignments };
    delete newAssignments[itemId];
    setItemAssignments(newAssignments);

    toast({
      title: "Item deleted",
      description: "Item removed from the bill.",
    });
  };

  const handleAnalyzeReceipt = async () => {
    if (!imagePreview) return;

    setIsAnalyzing(true);
    try {
      const data = await analyzeBillImage(imagePreview);
      setBillData(data);
      toast({
        title: "Success!",
        description: `Extracted ${data.items.length} items from your receipt.`,
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Could not analyze receipt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Load mock data for testing
  const handleLoadMockData = () => {
    setBillData(MOCK_BILL_DATA);
    toast({
      title: "Mock data loaded",
      description: `Loaded ${MOCK_BILL_DATA.items.length} test items.`,
    });
  };

  const handleAddPerson = () => {
    if (!newPersonName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a person's name.",
        variant: "destructive",
      });
      return;
    }

    const newPerson: Person = {
      id: `person-${Date.now()}`,
      name: newPersonName.trim(),
    };

    setPeople([...people, newPerson]);
    setNewPersonName("");
  };

  const handleRemovePerson = (personId: string) => {
    setPeople(people.filter(p => p.id !== personId));
    // Remove this person from all item assignments
    const newAssignments = { ...itemAssignments };
    Object.keys(newAssignments).forEach(itemId => {
      newAssignments[itemId] = newAssignments[itemId].filter(pid => pid !== personId);
    });
    setItemAssignments(newAssignments);
  };

  const handleItemAssignment = (itemId: string, personId: string, checked: boolean) => {
    const currentAssignments = itemAssignments[itemId] || [];

    if (checked) {
      // Add person to this item
      setItemAssignments({
        ...itemAssignments,
        [itemId]: [...currentAssignments, personId],
      });
    } else {
      // Remove person from this item
      setItemAssignments({
        ...itemAssignments,
        [itemId]: currentAssignments.filter(pid => pid !== personId),
      });
    }
  };

  // Check if all items are assigned
  const allItemsAssigned = useMemo(() => {
    if (!billData) return false;
    return billData.items.every(item => {
      const assignments = itemAssignments[item.id] || [];
      return assignments.length > 0;
    });
  }, [billData, itemAssignments]);

  // Get the tip amount (custom or from bill data)
  const effectiveTip = useMemo(() => {
    const customTipValue = parseFloat(customTip);
    if (!isNaN(customTipValue) && customTipValue >= 0) {
      return customTipValue;
    }
    return billData?.tip || 0;
  }, [customTip, billData]);

  // Calculate totals for each person
  const personTotals = useMemo((): PersonTotal[] => {
    if (!billData || people.length === 0 || !allItemsAssigned) return [];

    // Calculate each person's subtotal from assigned items
    const personSubtotals: { [personId: string]: number } = {};
    people.forEach(person => {
      personSubtotals[person.id] = 0;
    });

    billData.items.forEach(item => {
      const assignedPeople = itemAssignments[item.id] || [];
      if (assignedPeople.length > 0) {
        // Split the item cost among all assigned people
        const splitPrice = item.price / assignedPeople.length;
        assignedPeople.forEach(personId => {
          if (personSubtotals[personId] !== undefined) {
            personSubtotals[personId] += splitPrice;
          }
        });
      }
    });

    // Calculate total of all assigned items
    const totalAssignedSubtotal = Object.values(personSubtotals).reduce((sum, val) => sum + val, 0);

    // Calculate proportional tax and tip for each person
    const results: PersonTotal[] = people.map(person => {
      const personSubtotal = personSubtotals[person.id];
      const proportion = totalAssignedSubtotal > 0 ? personSubtotal / totalAssignedSubtotal : 0;
      const personTax = billData.tax * proportion;
      const personTip = effectiveTip * proportion;
      const personTotal = personSubtotal + personTax + personTip;

      return {
        personId: person.id,
        name: person.name,
        itemsSubtotal: personSubtotal,
        tax: personTax,
        tip: personTip,
        total: personTotal,
      };
    });

    return results.filter(pt => pt.total > 0); // Only show people with items assigned
  }, [billData, people, itemAssignments, allItemsAssigned, effectiveTip]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
              <Receipt className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">SplitBill</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
              Split Your Bill Instantly
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload a photo of your receipt and let AI do the math. Fair splitting with tax and tip included.
            </p>
            <div className="flex gap-2 justify-center mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadMockData}
              >
                Load Test Data
              </Button>
              {billData && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartOver}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Start Over
                </Button>
              )}
            </div>
          </div>

          {/* Upload Card */}
          <Card
            className={`p-8 shadow-medium border-2 border-dashed transition-all duration-300 ${
              isDragging
                ? 'border-primary bg-primary/10 scale-[1.02]'
                : imagePreview
                ? 'border-primary/40'
                : 'border-primary/20 hover:border-primary/40'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {!imagePreview ? (
              <div className="flex flex-col items-center justify-center space-y-6 py-12">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-10 h-10 text-primary" />
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold">Upload Your Receipt</h3>
                  <p className="text-muted-foreground">
                    Drag and drop or click to upload your bill
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/heic,image/heif"
                  onChange={handleFileInput}
                  className="hidden"
                />

                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Choose File
                </Button>

                <p className="text-sm text-muted-foreground">
                  Supports JPG, PNG, HEIC • Max 20MB
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    <span className="font-medium">{selectedFile?.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="relative rounded-lg overflow-hidden border">
                  <img
                    src={imagePreview}
                    alt="Receipt preview"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                </div>

                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  onClick={handleAnalyzeReceipt}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing Receipt...
                    </>
                  ) : (
                    <>
                      <Receipt className="mr-2 h-5 w-5" />
                      Analyze Receipt
                    </>
                  )}
                </Button>
                {isAnalyzing && (
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    This may take a few moments. AI is extracting items from your receipt...
                  </p>
                )}
              </div>
            )}
          </Card>

          {/* Bill Data Display */}
          {billData && (
            <div className="mt-12 space-y-6">
              {/* People Management */}
              <Card className="p-4 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-semibold">People</h3>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                  <Input
                    placeholder="Enter person's name"
                    value={newPersonName}
                    onChange={(e) => setNewPersonName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddPerson()}
                    className="flex-1"
                  />
                  <Button onClick={handleAddPerson} className="sm:w-auto">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>

                {people.length > 0 && (
                  <div className="space-y-2">
                    {people.map((person) => (
                      <div
                        key={person.id}
                        className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                      >
                        <span className="font-medium">{person.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePerson(person.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {people.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Add people to start splitting the bill
                  </p>
                )}
              </Card>

              {/* Items Table */}
              <Card className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-semibold">Bill Items</h3>
                  </div>

                  {people.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-sm text-muted-foreground">Assignment mode:</span>
                      <RadioGroup
                        value={assignmentMode}
                        onValueChange={(value) => setAssignmentMode(value as AssignmentMode)}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="checkboxes" id="checkboxes" />
                          <Label htmlFor="checkboxes" className="cursor-pointer">Checkboxes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="dropdown" id="dropdown" />
                          <Label htmlFor="dropdown" className="cursor-pointer">Dropdown</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                </div>

                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px]">Item</TableHead>
                        <TableHead className="text-right min-w-[80px]">Price</TableHead>
                        {people.length > 0 && (
                          <TableHead className="min-w-[200px]">Assigned To</TableHead>
                        )}
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {billData.items.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={people.length > 0 ? 4 : 3} className="text-center py-8 text-muted-foreground">
                            No items found. Try analyzing another receipt or add items manually.
                          </TableCell>
                        </TableRow>
                      ) : (
                        billData.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {editingItemId === item.id ? (
                              <Input
                                value={editingItemName}
                                onChange={(e) => setEditingItemName(e.target.value)}
                                className="h-8"
                              />
                            ) : (
                              item.name
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {editingItemId === item.id ? (
                              <div className="relative ml-auto w-24">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                                <Input
                                  type="number"
                                  value={editingItemPrice}
                                  onChange={(e) => setEditingItemPrice(e.target.value)}
                                  className="h-8 text-right pl-5"
                                  step="0.01"
                                  min="0"
                                />
                              </div>
                            ) : (
                              `$${item.price.toFixed(2)}`
                            )}
                          </TableCell>
                          {people.length > 0 && (
                            <TableCell>
                              {assignmentMode === "checkboxes" ? (
                                <div className="flex flex-wrap gap-4">
                                  {people.map((person) => (
                                    <div key={person.id} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`${item.id}-${person.id}`}
                                        checked={(itemAssignments[item.id] || []).includes(person.id)}
                                        onCheckedChange={(checked) =>
                                          handleItemAssignment(item.id, person.id, checked as boolean)
                                        }
                                      />
                                      <label
                                        htmlFor={`${item.id}-${person.id}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                      >
                                        {person.name}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between">
                                      {(itemAssignments[item.id] || []).length === 0
                                        ? "Select people..."
                                        : `${(itemAssignments[item.id] || []).length} selected`}
                                      <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-64 p-0">
                                    <div className="p-4 space-y-2">
                                      {people.map((person) => (
                                        <div key={person.id} className="flex items-center space-x-2">
                                          <Checkbox
                                            id={`dropdown-${item.id}-${person.id}`}
                                            checked={(itemAssignments[item.id] || []).includes(person.id)}
                                            onCheckedChange={(checked) =>
                                              handleItemAssignment(item.id, person.id, checked as boolean)
                                            }
                                          />
                                          <label
                                            htmlFor={`dropdown-${item.id}-${person.id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                          >
                                            {person.name}
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              )}
                            </TableCell>
                          )}
                          <TableCell>
                            {editingItemId === item.id ? (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={handleSaveItemEdit}
                                >
                                  <Check className="w-4 h-4 text-green-600" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={handleCancelItemEdit}
                                >
                                  <X className="w-4 h-4 text-muted-foreground" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditItem(item.id, item.name, item.price)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteItem(item.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      )))}
                    </TableBody>
                  </Table>
                </div>

                {people.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4 mt-4">
                    Add people above to assign items
                  </p>
                )}

                {/* Bill Summary */}
                <div className="mt-6 space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">${billData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax:</span>
                    <span className="font-medium">${billData.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-base">
                    <span className="text-muted-foreground font-semibold">Tip:</span>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          type="number"
                          placeholder={billData.tip.toFixed(2)}
                          value={customTip}
                          onChange={(e) => setCustomTip(e.target.value)}
                          className="w-32 h-10 text-right text-base pl-6"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>${(billData.subtotal + billData.tax + effectiveTip).toFixed(2)}</span>
                  </div>
                </div>
              </Card>

              {/* Person Totals */}
              {people.length > 0 && !allItemsAssigned && (
                <Card className="p-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-800 dark:text-amber-200 text-center">
                    Please assign all items to see the split summary
                  </p>
                </Card>
              )}

              {personTotals.length > 0 && (
                <Card className="p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-semibold">Split Summary</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {personTotals.map((pt) => (
                      <div
                        key={pt.personId}
                        className="p-4 bg-secondary/30 rounded-lg border border-primary/10"
                      >
                        <div className="font-semibold text-lg mb-3">{pt.name}</div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Items:</span>
                            <span>${pt.itemsSubtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tax:</span>
                            <span>${pt.tax.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground font-semibold">Tip:</span>
                            <span className="font-semibold">${pt.tip.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                            <span>Total:</span>
                            <span className="text-primary">${pt.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Features */}
          {!billData && (
            <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card className="p-6 text-center space-y-3 hover:shadow-medium transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                <Receipt className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold">AI-Powered</h4>
              <p className="text-sm text-muted-foreground">
                Gemini AI extracts items, tax, and tip automatically
              </p>
            </Card>

            <Card className="p-6 text-center space-y-3 hover:shadow-medium transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h4 className="font-semibold">Fair Splitting</h4>
              <p className="text-sm text-muted-foreground">
                Assign items to people with proportional tax & tip
              </p>
            </Card>

            <Card className="p-6 text-center space-y-3 hover:shadow-medium transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-primary-glow/10 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-primary-glow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="font-semibold">Instant Results</h4>
              <p className="text-sm text-muted-foreground">
                See who owes what in seconds, no manual math needed
              </p>
            </Card>
          </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
