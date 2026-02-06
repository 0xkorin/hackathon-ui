import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import Home from "../page";

const mockUseAccount = vi.fn();
const mockUseChainId = vi.fn();
const mockUseReadContract = vi.fn();
const mockUseWriteContract = vi.fn();

vi.mock("wagmi", () => ({
  useAccount: () => mockUseAccount(),
  useChainId: () => mockUseChainId(),
  useReadContract: (args: unknown) => mockUseReadContract(args),
  useWriteContract: () => mockUseWriteContract()
}));

vi.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: {
    Custom: ({ children }: { children: (props: unknown) => React.ReactNode }) =>
      children({
        account: { displayName: "0xabc" },
        chain: { name: "Sepolia" },
        openAccountModal: vi.fn(),
        openChainModal: vi.fn(),
        openConnectModal: vi.fn(),
        mounted: true
      })
  }
}));

const YFI_ADDRESS = "0xD4c188F035793EEcaa53808Cc067099100b653Ba";
const STYFI_ADDRESS = "0x4FeC571e38EB31ae8c8C51B8b6Bcb404514dC822";

const makeReadContractReturn = () => ({ data: 0n });
const allowanceValue = 2n * 10n ** 18n;

const setupWriteContracts = () => {
  const approveWriter = vi.fn();
  const depositWriter = vi.fn();
  mockUseWriteContract.mockReset();
  mockUseWriteContract
    .mockReturnValueOnce({ writeContract: approveWriter, isPending: false })
    .mockReturnValueOnce({ writeContract: depositWriter, isPending: false });
  return { approveWriter, depositWriter };
};

describe("Home", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAccount.mockReturnValue({ address: "0xabc", isConnected: true });
    mockUseReadContract.mockImplementation(() => {
      return makeReadContractReturn();
    });
  });

  it("shows a Sepolia warning when on another chain", () => {
    setupWriteContracts();
    mockUseChainId.mockReturnValue(1);

    render(<Home />);

    expect(screen.getByText("Switch to Sepolia to use YFI.")).toBeInTheDocument();
  });

  it("approves using the Sepolia addresses", async () => {
    const { approveWriter } = setupWriteContracts();
    mockUseChainId.mockReturnValue(11155111);

    render(<Home />);

    const input = screen.getByLabelText("Amount");
    await userEvent.type(input, "1");

    const approveButton = screen.getByRole("button", { name: "Approve YFI" });
    await userEvent.click(approveButton);

    expect(mockUseReadContract).toHaveBeenCalledWith(
      expect.objectContaining({
        address: YFI_ADDRESS,
        args: ["0xabc", STYFI_ADDRESS]
      })
    );

    expect(approveWriter).toHaveBeenCalledWith(
      expect.objectContaining({
        address: YFI_ADDRESS,
        functionName: "approve",
        args: [STYFI_ADDRESS, expect.anything()]
      })
    );
  });

  it("deposits into stYFI using ERC4626", async () => {
    const { depositWriter } = setupWriteContracts();
    mockUseChainId.mockReturnValue(11155111);
    mockUseReadContract.mockReturnValue({ data: allowanceValue });

    render(<Home />);

    const input = screen.getByLabelText("Amount");
    await userEvent.type(input, "1");

    const depositButton = screen.getByRole("button", { name: "Deposit YFI" });
    await userEvent.click(depositButton);

    expect(depositWriter).toHaveBeenCalledWith(
      expect.objectContaining({
        address: STYFI_ADDRESS,
        functionName: "deposit",
        args: [expect.anything(), "0xabc"]
      })
    );
  });
});
