import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { findNearbySocieties, type NearbyResult } from "@/services/ai";
import { societyService, householdService, joinRequestService } from "@/services";
import type { Household, Society } from "@/mocks/data";
import { toast } from "sonner";
import { MapPin, Sparkles, CheckCircle2, Upload } from "lucide-react";

export const Route = createFileRoute("/join-society")({
  head: () => ({ meta: [{ title: "Join a society — CEN" }] }),
  component: JoinSociety,
});

function JoinSociety() {
  const [selectedSociety, setSelectedSociety] = useState<Society | null>(null);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  if (selectedSociety) {
    return <JoinFlow society={selectedSociety} step={step} setStep={setStep} onBack={() => { setSelectedSociety(null); setStep(1); }} />;
  }

  return (
    <div className="mx-auto max-w-3xl p-4 py-10">
      <Link to="/" className="text-sm text-muted-foreground hover:underline">← Back</Link>
      <h1 className="mt-4 text-3xl font-bold">Join a society</h1>
      <p className="text-muted-foreground">Find your society by address or enter your invite key.</p>

      <Tabs defaultValue="address" className="mt-6">
        <TabsList>
          <TabsTrigger value="address"><MapPin className="mr-2 h-4 w-4" />Find by address</TabsTrigger>
          <TabsTrigger value="key">Join by key</TabsTrigger>
        </TabsList>
        <TabsContent value="address">
          <FindByAddress onPick={(s) => { setSelectedSociety(s); setStep(1); }} />
        </TabsContent>
        <TabsContent value="key">
          <JoinByKey onPick={(s) => { setSelectedSociety(s); setStep(1); }} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FindByAddress({ onPick }: { onPick: (s: Society) => void }) {
  const [addr, setAddr] = useState("");
  const [results, setResults] = useState<NearbyResult[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    setLoading(true);
    // TODO: connect to real AI backend endpoint (geocoding + proximity + AI ranking)
    const r = await findNearbySocieties(addr);
    setResults(r);
    setLoading(false);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Label>Your address</Label>
        <div className="mt-2 flex gap-2">
          <Input placeholder="e.g. 12 Park Ave, Bengaluru" value={addr} onChange={(e) => setAddr(e.target.value)} />
          <Button onClick={search} disabled={loading}>
            <Sparkles className="mr-2 h-4 w-4" />
            {loading ? "Searching…" : "Find societies"}
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">AI-powered: we rank societies by proximity to your address.</p>

        <div className="mt-6 space-y-3">
          {results.map((r) => (
            <div key={r.society.id} className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <div className="font-semibold">{r.society.name}</div>
                <div className="text-sm text-muted-foreground">{r.society.type} · {r.distanceKm} km away</div>
                <div className="mt-1 text-xs text-muted-foreground italic">{r.matchReason}</div>
              </div>
              <Button onClick={() => onPick(r.society)}>Select</Button>
            </div>
          ))}
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

function JoinFlow({ society, step, setStep, onBack }: {
  society: Society; step: 1 | 2 | 3 | 4;
  setStep: (s: 1 | 2 | 3 | 4) => void; onBack: () => void;
}) {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [chosen, setChosen] = useState<Household | null>(null);
  const [form, setForm] = useState({ name: "", contact: "" });
  const [file, setFile] = useState<string>("");

  const loadHouseholds = async () => {
    // TODO: replace with real API call to backend
    const list = await householdService.listBySociety(society.id);
    setHouseholds(list);
  };

  if (step === 1 && households.length === 0) loadHouseholds();

  return (
    <div className="mx-auto max-w-2xl p-4 py-10">
      <button onClick={onBack} className="text-sm text-muted-foreground hover:underline">← Choose a different society</button>
      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{society.name}</CardTitle>
            <Badge>Step {step} of 4</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <>
              <Label>Claim your household</Label>
              <div className="mt-2 grid max-h-72 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
                {households.map((h) => (
                  <button
                    key={h.id}
                    disabled={h.claimed}
                    onClick={() => setChosen(h)}
                    className={`rounded-md border p-3 text-sm ${
                      h.claimed
                        ? "cursor-not-allowed bg-muted text-muted-foreground"
                        : chosen?.id === h.id
                          ? "border-primary bg-primary/10"
                          : "hover:border-primary"
                    }`}
                  >
                    {h.unitNumber}
                    {h.claimed && <div className="text-[10px]">Taken</div>}
                  </button>
                ))}
              </div>
              <Button className="mt-4 w-full" disabled={!chosen} onClick={() => setStep(2)}>Continue</Button>
            </>
          )}
          {step === 2 && (
            <div className="space-y-3">
              <div><Label>Full name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Contact</Label><Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></div>
              <Button className="w-full" disabled={!form.name || !form.contact} onClick={() => setStep(3)}>Continue</Button>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-3">
              <Label>Upload ID Proof</Label>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed p-8 text-sm text-muted-foreground hover:bg-muted/40">
                <Upload className="h-4 w-4" />
                {file ? `Selected: ${file}` : "Click to upload file"}
                <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0]?.name ?? "")} />
              </label>
              <p className="text-xs text-muted-foreground">Any government-issued ID. Kept confidential.</p>
              <Button className="w-full" disabled={!file} onClick={async () => {
                // TODO: replace with real API call to backend
                await joinRequestService.submit({
                  userId: "u-anon",
                  userName: form.name,
                  societyId: society.id,
                  householdId: chosen!.id,
                  unitNumber: chosen!.unitNumber,
                  idProofUrl: `mock://${file}`,
                });
                setStep(4);
              }}>Submit</Button>
            </div>
          )}
          {step === 4 && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="h-14 w-14 text-primary" />
              <div className="text-lg font-semibold">Request sent</div>
              <p className="text-sm text-muted-foreground">
                Your request has been sent to your society admin for approval.
              </p>
              <Link to="/login"><Button>Go to login</Button></Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
