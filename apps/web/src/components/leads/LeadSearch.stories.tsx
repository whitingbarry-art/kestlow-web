import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";
import { LEAD_SORTS } from "../../data/leads";
import { LeadSearch } from "./LeadSearch";

const meta = {
  title: "Leads/LeadSearch",
  component: LeadSearch,
  args: {
    text: "",
    onTextChange: fn(),
    onClear: fn(),
    search: "",
    total: 24,
    sortOptions: LEAD_SORTS,
    sort: "newest",
    onSortChange: fn(),
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs();
    return (
      <LeadSearch
        {...args}
        onTextChange={(text) => {
          args.onTextChange(text);
          updateArgs({ text, search: text.trim() });
        }}
        onClear={() => {
          args.onClear();
          updateArgs({ text: "", search: "" });
        }}
        onSortChange={(sort) => {
          args.onSortChange(sort);
          updateArgs({ sort });
        }}
      />
    );
  },
} satisfies Meta<typeof LeadSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Searching: Story = { args: { text: "Chislehurst", search: "Chislehurst", total: 3 } };

export const OneMatch: Story = { args: { text: "BR7 6LT", search: "BR7 6LT", total: 1 } };

export const NoMatches: Story = { args: { text: "Narnia", search: "Narnia", total: 0 } };

export const NearestFirst: Story = { args: { sort: "nearest" } };

export const Loading: Story = { args: { total: undefined } };
