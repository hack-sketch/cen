import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { societyService, householdService, joinRequestService, userService } from "@/services";
import { useAuth } from "@/lib/auth";
import { OnboardingSurveyModal } from "@/routes/app";
import type { Household, Society } from "@/mocks/data";
import { toast } from "sonner";
import { CheckCircle2, Upload, Lock, Search } from "lucide-react";

export const Route = createFileRoute("/join-society")({
  head: () => ({ meta: [{ title: "Join a society — CEN" }] }),
  component: JoinSociety,
});

function JoinSociety() {
  const { user, loading } = useAuth();
  const [selectedSociety, setSelectedSociety] = useState<Society | null>(null);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [showSurvey, setShowSurvey] = useState(false);

  useEffect(() => {
    if (user) {
      setShowSurvey(!user.hasCompletedSurvey);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-panel/10 font-body">
        <div className="flex flex-col items-center gap-5">
          <div className="relative flex items-center justify-center w-16 h-16">
            <div className="absolute inset-0 rounded-full border border-dashed border-deep-forest/40 animate-[spin_8s_linear_infinite]" />
            <div className="absolute w-11 h-11 rounded-full border-2 border-t-soft-violet border-r-transparent border-b-soft-violet border-l-transparent animate-[spin_1.5s_linear_infinite_reverse]" />
            {/* Core pulsing brand gradient sphere with a central 'C' */}
            <div className="absolute w-7 h-7 rounded-full bg-gradient-to-tr from-deep-forest to-soft-violet flex items-center justify-center shadow-md shadow-deep-forest/20 animate-pulse">
              <span className="text-[10px] font-extrabold text-white select-none leading-none">C</span>
            </div>
            <div className="absolute w-4 h-4 rounded-full bg-white opacity-40 animate-ping" />
          </div>
          <div className="flex flex-col items-center gap-1.5 text-center">
            <span className="text-[10px] font-bold text-ink uppercase tracking-[0.3em] animate-pulse">
              Verifying Session
            </span>
            <span className="text-[9px] text-on-surface-variant font-medium tracking-wide">
              Establishing community credentials...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-panel/20 p-4 font-body">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-deep-forest flex items-center justify-center font-bold text-white text-sm">C</div>
              <span className="font-bold text-ink uppercase tracking-widest text-xs">CEN Network</span>
            </Link>
          </div>
          <Card className="border-line/60 shadow-xl bg-white p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-soft-violet/10 flex items-center justify-center mx-auto text-soft-violet">
              <Lock className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold text-ink">Account Required</CardTitle>
              <CardDescription className="text-xs text-on-surface-variant leading-relaxed">
                You must sign in or create an account first to request to join a society. This links your onboarding request securely to your resident profile.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/signup" search={{ redirect: "/join-society" }}><Button className="w-full bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-10">Sign Up (Create Account)</Button></Link>
              <Link to="/login" search={{ redirect: "/join-society" }}><Button variant="outline" className="w-full h-10 border-line-strong hover:bg-panel text-xs font-semibold">Sign In (Login)</Button></Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (showSurvey) {
    return <OnboardingSurveyModal user={user} onComplete={() => setShowSurvey(false)} buttonText="Continue" />;
  }

  if (selectedSociety) {
    return <JoinFlow society={selectedSociety} step={step} setStep={setStep} onBack={() => { setSelectedSociety(null); setStep(1); }} />;
  }

  return (
    <div className="mx-auto max-w-3xl p-4 py-10">
      <Link to="/" className="text-sm text-muted-foreground hover:underline">← Back</Link>
      <h1 className="mt-4 text-3xl font-bold">Join a society</h1>
      <p className="text-muted-foreground">Search for your society by name or enter your invite key.</p>

      <Tabs defaultValue="name" className="mt-6">
        <TabsList>
          <TabsTrigger value="name"><Search className="mr-2 h-4 w-4" />Search by name</TabsTrigger>
          <TabsTrigger value="key">Join by key</TabsTrigger>
        </TabsList>
        <TabsContent value="name">
          <FindByName onPick={(s) => { setSelectedSociety(s); setStep(1); }} />
        </TabsContent>
        <TabsContent value="key">
          <JoinByKey onPick={(s) => { setSelectedSociety(s); setStep(1); }} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FindByName({ onPick }: { onPick: (s: Society) => void }) {
  const [query, setQuery] = useState("");
  const [societies, setSocieties] = useState<Society[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await societyService.list(query);
        if (isMounted) setSocieties(res || []);
      } catch (err) {
        toast.error("Failed to load societies");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      loadData();
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query]);

  const filtered = societies.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    s.address.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Card className="border-line/60 shadow-md">
      <CardContent className="pt-6 space-y-4">
        <div>
          <Label className="text-xs font-bold text-ink uppercase tracking-wider">Search Societies by Name</Label>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Type to search society by name or address (e.g. Green Oasis, Sunrise)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-8 text-sm h-11 border-line-strong/60 focus:border-deep-forest focus:ring-1 focus:ring-deep-forest/20"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground hover:text-ink"
              >
                ✕
              </button>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {query ? `Filtering societies matching "${query}"` : "All active registered societies on CEN network."}
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading societies directory...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground space-y-2">
              <p className="font-semibold text-ink">No societies found matching "{query}"</p>
              <p className="text-xs text-muted-foreground">Try clearing your search term or searching by a different name/keyword.</p>
            </div>
          ) : (
            filtered.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-xl border border-line/60 p-4 bg-white hover:border-deep-forest/40 hover:shadow-sm transition-all"
              >
                <div>
                  <div className="font-semibold text-ink flex items-center gap-2">
                    {s.name}
                    {s.status === "active" && (
                      <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                        Active Network
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{s.type} · {s.address}</div>
                </div>
                <Button onClick={() => onPick(s)} className="bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-9 px-4">
                  Select
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function JoinByKey({ onPick }: { onPick: (s: Society) => void }) {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);

  const cont = async () => {
    setLoading(true);
    // TODO: replace with real API call to backend
    const list = await societyService.list();
    const match = list.find((s) => s.key.toLowerCase() === key.toLowerCase());
    setLoading(false);
    if (!match) return toast.error("No society found with that key");
    onPick(match);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Label>Society key</Label>
        <div className="mt-2 flex gap-2">
          <Input placeholder="e.g. GREEN-2024" value={key} onChange={(e) => setKey(e.target.value)} />
          <Button onClick={cont} disabled={loading}>Continue</Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Try <code className="rounded bg-muted px-1">GREEN-2024</code> for demo.</p>
      </CardContent>
    </Card>
  );
}

function JoinFlow({
  society,
  step,
  setStep,
  onBack,
}: {
  society: Society;
  step: 1 | 2 | 3 | 4;
  setStep: (s: 1 | 2 | 3 | 4) => void;
  onBack: () => void;
}) {
  const { user } = useAuth();
  const [households, setHouseholds] = useState<Household[]>([]);
  const [primaryLeadsMap, setPrimaryLeadsMap] = useState<Record<string, string>>({});
  const [chosen, setChosen] = useState<Household | null>(null);
  const [form, setForm] = useState({ name: user?.name || "", contact: user?.email || "" });
  const [file, setFile] = useState<string>("");
  const [fileDataUrl, setFileDataUrl] = useState<string>("");

  // Responsive pagination state
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [joinPage, setJoinPage] = useState(1);

  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadHouseholds = async () => {
    const list = await householdService.listBySociety(society.id);
    const users = await userService.listBySociety(society.id);

    // Build map of householdId -> Primary Resident Name
    const map: Record<string, string> = {};
    if (Array.isArray(users)) {
      users.forEach((u) => {
        if (u.householdId) {
          if (u.isPrimaryResident || !map[u.householdId]) {
            map[u.householdId] = u.name;
          }
        }
      });
    }

    setPrimaryLeadsMap(map);
    setHouseholds(list || []);
  };

  if (step === 1 && households.length === 0) loadHouseholds();

  const threshold = isSmallScreen ? 30 : 50;
  const showPagination = households.length > threshold;
  const displayHouseholds = showPagination 
    ? households.slice((joinPage - 1) * threshold, joinPage * threshold)
    : households;

  const chosenLeadName = chosen ? (primaryLeadsMap[chosen.id] || chosen.claimedByName || "Primary Resident") : "";
  const isChosenOccupied = chosen ? (chosen.claimed || !!chosen.claimedByUserId || (chosen.occupantsCount && chosen.occupantsCount > 0)) : false;

  return (
    <div className="mx-auto max-w-3xl p-4 py-10">
      <button onClick={onBack} className="text-sm font-semibold text-deep-forest hover:underline cursor-pointer">← Choose a different society</button>
      <Card className="mt-4 border-line/65 shadow-lg bg-white overflow-hidden">
        <CardHeader className="bg-panel/40 border-b border-line/50 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-ink">{society.name}</CardTitle>
              <CardDescription className="text-xs text-on-surface-variant mt-0.5">{society.address}</CardDescription>
            </div>
            <Badge className="bg-deep-forest text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1">Step {step} of 4</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {step === 1 && (
            <>
              <div className="space-y-1">
                <Label className="text-xs uppercase font-extrabold tracking-wider text-on-surface-variant">Select Household Unit</Label>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Select an available vacant unit to become the <strong>Primary Lead</strong>, or select an occupied unit to join as a <strong>Secondary Member</strong> (approval request routed to the Primary Lead).
                </p>
              </div>

              <div className="mt-4 grid max-h-80 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 overflow-y-auto p-1">
                {displayHouseholds.map((h) => {
                  const maxM = h.maxMembers || 4;
                  const primaryLeadName = primaryLeadsMap[h.id] || h.claimedByName;
                  const isOccupied = h.claimed || !!h.claimedByUserId || !!primaryLeadName || (h.occupantsCount && h.occupantsCount > 0);
                  const occ = h.occupantsCount || (isOccupied ? 1 : 0);
                  const isFull = occ >= maxM;
                  const isChosen = chosen?.id === h.id;

                  return (
                    <button
                      key={h.id}
                      type="button"
                      disabled={isFull}
                      onClick={() => setChosen(h)}
                      className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer flex flex-col justify-between min-h-[82px] relative overflow-hidden ${
                        isFull
                          ? "cursor-not-allowed bg-slate-100/70 border-slate-200 text-slate-400 opacity-60"
                          : isChosen
                            ? isOccupied
                              ? "border-amber-400 bg-amber-50/90 ring-2 ring-amber-300 shadow-xs"
                              : "border-emerald-500 bg-emerald-50/90 ring-2 ring-emerald-300 shadow-xs"
                            : isOccupied
                              ? "border-amber-200/90 bg-gradient-to-br from-amber-50/40 to-white hover:border-amber-400 hover:bg-amber-50/80 text-ink"
                              : "border-line bg-white hover:border-emerald-400 text-ink hover:shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 w-full border-b border-line/20 pb-1.5">
                        <span className="font-extrabold text-sm text-ink">{h.unitNumber}</span>
                        <Badge className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border ${
                          isFull
                            ? "bg-slate-200 text-slate-700 border-slate-300"
                            : isOccupied
                              ? "bg-amber-100 text-amber-950 border-amber-300"
                              : "bg-emerald-100 text-emerald-900 border-emerald-300"
                        }`}>
                          {isFull ? `Full (${occ}/${maxM})` : isOccupied ? `${occ}/${maxM} Filled` : `Vacant`}
                        </Badge>
                      </div>

                      <div className="mt-2 text-[10px] font-semibold text-on-surface-variant truncate">
                        {isFull ? (
                          <span className="text-slate-500">Unit Capacity Full</span>
                        ) : isOccupied ? (
                          <span className="text-amber-950 font-bold truncate flex items-center gap-1">
                            <span className="text-amber-600">👑</span> {primaryLeadName ? `Lead: ${primaryLeadName}` : "Primary Lead Occupied"}
                          </span>
                        ) : (
                          <span className="text-emerald-800 font-bold flex items-center gap-1">
                            <span>🛡️</span> Vacant (Admin Approval)
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {chosen && (
                <div className={`mt-5 rounded-xl p-4 border text-xs flex items-start gap-3 shadow-xs ${
                  isChosenOccupied
                    ? "bg-gradient-to-r from-amber-50/90 via-amber-50/50 to-white border-amber-300 text-amber-950"
                    : "bg-gradient-to-r from-emerald-50/90 via-emerald-50/50 to-white border-emerald-300 text-emerald-950"
                }`}>
                  <div className="text-lg">
                    {isChosenOccupied ? "👑" : "🛡️"}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="font-bold text-sm">
                      Household Unit {chosen.unitNumber} Selected
                    </div>
                    <div className="text-xs leading-relaxed opacity-90">
                      {isChosenOccupied
                        ? `This unit is currently lead by ${chosenLeadName}. Your request will be sent directly to ${chosenLeadName} for approval as a Secondary Member.`
                        : `This unit is currently vacant. Upon approval by Society Administration, you will be assigned as the Primary Resident Lead.`}
                    </div>
                  </div>
                </div>
              )}

              {showPagination && (
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-line/45">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={joinPage === 1}
                    onClick={() => setJoinPage(joinPage - 1)}
                    className="text-xs font-semibold px-3 h-8 cursor-pointer border-line-strong hover:bg-panel"
                  >
                    Previous
                  </Button>
                  <span className="text-xs text-on-surface-variant font-medium">
                    Page {joinPage} of {Math.ceil(households.length / threshold)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={joinPage === Math.ceil(households.length / threshold)}
                    onClick={() => setJoinPage(joinPage + 1)}
                    className="text-xs font-semibold px-3 h-8 cursor-pointer border-line-strong hover:bg-panel"
                  >
                    Next
                  </Button>
                </div>
              )}

              <Button className="mt-5 w-full bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-10 rounded-lg shadow-sm cursor-pointer active:scale-98 transition-all" disabled={!chosen} onClick={() => setStep(2)}>Continue to Resident Info</Button>
            </>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <div><Label className="text-xs font-bold text-ink">Full name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border-line-strong text-xs h-10 rounded-lg" /></div>
              <div><Label className="text-xs font-bold text-ink">Contact Email</Label><Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className="border-line-strong text-xs h-10 rounded-lg" /></div>
              <Button className="w-full bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-10 rounded-lg shadow-sm cursor-pointer active:scale-98 transition-all" disabled={!form.name || !form.contact} onClick={() => setStep(3)}>Continue to ID Upload</Button>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-ink">Upload Government ID Proof</Label>
                <p className="text-[11px] text-on-surface-variant">Select an image of your Aadhaar, Passport, or Driving License. Kept 100% confidential.</p>
              </div>

              {fileDataUrl ? (
                <div className="space-y-3">
                  <div className="border border-line rounded-xl bg-panel/30 p-3 flex flex-col items-center justify-center shadow-inner h-52 overflow-hidden relative">
                    <img src={fileDataUrl} alt="ID Proof Preview" className="max-h-48 w-full object-contain rounded-lg shadow-sm border bg-white" />
                  </div>
                  <div className="flex justify-between items-center text-xs px-1">
                    <span className="font-semibold text-ink truncate max-w-[220px]">{file}</span>
                    <label className="text-deep-forest font-bold hover:underline cursor-pointer">
                      Change Photo
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        onChange={(e) => {
                          const selected = e.target.files?.[0];
                          if (selected) {
                            if (selected.size > 1 * 1024 * 1024) {
                              toast.error("ID proof file size must be less than 1 MB.");
                              return;
                            }
                            setFile(selected.name);
                            const reader = new FileReader();
                            reader.onload = () => {
                              if (typeof reader.result === "string") {
                                setFileDataUrl(reader.result);
                              }
                            };
                            reader.readAsDataURL(selected);
                          }
                        }} 
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line-strong/60 p-8 text-sm text-muted-foreground hover:bg-muted/40 hover:border-deep-forest/50 transition-all">
                  <Upload className="h-6 w-6 text-deep-forest" />
                  <span className="font-semibold text-ink text-xs">{file ? `Selected: ${file}` : "Click to select ID image (Max 1 MB)"}</span>
                  <span className="text-[10px] text-on-surface-variant">PNG, JPG, JPEG or WebP (Max 1 MB)</span>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="hidden" 
                    onChange={(e) => {
                      const selected = e.target.files?.[0];
                      if (selected) {
                        if (selected.size > 1 * 1024 * 1024) {
                          toast.error("ID proof file size must be less than 1 MB.");
                          return;
                        }
                        setFile(selected.name);
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (typeof reader.result === "string") {
                            setFileDataUrl(reader.result);
                          }
                        };
                        reader.readAsDataURL(selected);
                      }
                    }} 
                  />
                </label>
              )}

              <Button className="w-full bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-10 rounded-lg shadow-sm cursor-pointer active:scale-98 transition-all" disabled={!file} onClick={async () => {
                try {
                  await joinRequestService.submit({
                    userId: user!.id,
                    userName: form.name || user!.name,
                    societyId: society.id,
                    householdId: chosen!.id,
                    unitNumber: chosen!.unitNumber,
                    idProofUrl: fileDataUrl || `mock://${file}`,
                  });
                  toast.success("Join request submitted successfully!");
                  setStep(4);
                } catch (err: any) {
                  toast.error(err.message || "Failed to submit join request");
                }
              }}>Submit Join Request</Button>
            </div>
          )}
          {step === 4 && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="h-14 w-14 text-emerald-600" />
              <div className="text-lg font-bold text-ink">Request Submitted Successfully</div>
              <p className="text-sm text-on-surface-variant leading-relaxed max-w-md">
                {isChosenOccupied
                  ? `Your request to join unit ${chosen?.unitNumber} as a Secondary Member has been sent directly to the Primary Lead (${chosenLeadName}) for approval.`
                  : `Your request to join unit ${chosen?.unitNumber} as Primary Lead has been sent to the Society Admin for approval.`}
              </p>
              <Link to="/app/dashboard"><Button className="bg-deep-forest hover:bg-deep-forest/90 text-white font-semibold text-xs h-10 px-6 rounded-lg active:scale-98 transition-all mt-2">Go to Console Dashboard</Button></Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
