import smartpy as sp





class Poll(sp.Contract):
    def __init__(self, admin: sp.TAddress):
        self.init(
            administrator = admin,
            voters = sp.big_map(),
            votes = sp.big_map(),
            polls = sp.big_map().
        )

    # @sp.entry_point
    # def check(self, ad):
    #     sp.verify(self.data.admin == ad)
    
    # @sp.entry_point
    # def test_update_map(self, v):
    #     self.data.totals = sp.update_map(self.data.totals, 0, v)
    
    # @sp.entry_point
    def add_voter_internal(self, params):
        self.data.voters = sp.update_map(self.data.voters, params, sp.some(sp.unit))
    
    def remove_voter_internal(self, params):
        self.data.voters = sp.update_map(self.data.voters, params, sp.none)
    
    # @sp.entry_point
    def create_poll_internal(self, id, params):
        poll_meta = sp.record(end_date = params.e, num_option = params.n)
        tot = sp.map(tkey = sp.TNat, tvalue = sp.TNat)
        poll = sp.record(metadata = poll_meta, totals = tot)
        self.data.polls = sp.update_map(self.data.polls, id, sp.some(poll))
    
    def decrement_old_vote(self,old_vote, totals_map):
        total_vote = totals_map[old_vote]
        totals_map = sp.update_map(totals_map, old_vote, sp.some(abs(total_vote - sp.nat(1))))
        sp.result(totals_map)
    
    def increment_new_voteself(self, new_vote, totals_map):
        sp.if totals_map.contains(new_vote):
            total_vote = totals_map[new_vote]
            new_totals_map = sp.update_map(totals_map, new_vote, sp.some(total_vote + sp.nat(1)))
        sp.else:
            new_totals_map = sp.update_map(totals_map, new_vote, sp.some(sp.nat(1)))
        sp.result(new_totals_map)
        
    
    @sp.entry_point
    def create_poll(self, create_poll_arg):
        # sp.set_type(create_poll_arg, sp.TRecord(sp.TString, sp.TRecord(sp.TTimestamp, sp.TNat)))
        sp.verify(self.data.administrator == sp.sender)
        self.create_poll_internal(create_poll_arg.id, create_poll_arg.meta_data)
    
        
    @sp.entry_point
    def vote(self, vote_arg):
        check_if_valid_voter = self.data.voters.contains(sp.sender)
        sp.verify(check_if_valid_voter)
        poll = self.data.polls[vote_arg.id]
        metadata = poll.metadata
        totals = poll.totals
        sp.verify(sp.now <= metadata.end_date)
        sp.verify(vote_arg.my_vote <= metadata.num_option)
        mvote = vote_arg.my_vote
        sp.trace(mvote)
        sp.if self.data.votes.contains((sp.sender, vote_arg.id)):
            old_vote, self.data.votes = sp.get_and_update(self.data.votes, (sp.sender, vote_arg.id), sp.some(mvote))
            old_val = totals[old_vote]
            new_old_val = abs(old_val - 1 )
            totals = sp.update_map(totals, old_vote, sp.some(new_old_val))
            sp.if totals.contains(mvote):
                old_new_val = totals[mvote]
                new_val = old_new_val + sp.nat(1)
                totals = sp.update_map(totals, old_vote, sp.some(new_val))
                poll = sp.record(metadata = metadata, totals = totals)
                self.data.polls = sp.update_map(self.data.polls, vote_arg.id, sp.some(poll))
            sp.else:
                totals = sp.update_map(totals, mvote, sp.some(sp.nat(1)))
                poll = sp.record(metadata = metadata, totals = totals)
                self.data.polls = sp.update_map(self.data.polls, vote_arg.id, sp.some(poll))
        sp.else:
            self.data.votes = sp.update_map(self.data.votes, (sp.sender, vote_arg.id), sp.some(2))
            sp.if totals.contains(mvote):
                self.data.votes = sp.update_map(self.data.votes, (sp.sender, vote_arg.id), sp.some(1))
                old_val = totals.get(mvote)
                new_val = sp.nat(1) + old_val #sp.as_nat(old_val) + sp.nat(1)
                totals = sp.update_map(totals, mvote, sp.some((new_val)))
                poll = sp.record(metadata = metadata, totals = totals)
                self.data.polls = sp.update_map(self.data.polls, vote_arg.id, sp.some(poll))
            sp.else:
                self.data.votes = sp.update_map(self.data.votes, (sp.sender, vote_arg.id), sp.some(3))
                totals = sp.update_map(totals, mvote, sp.some(sp.nat(1)))
                poll = sp.record(metadata = metadata, totals = totals)
                self.data.polls = sp.update_map(self.data.polls, vote_arg.id, sp.some(poll))
            
        
        

    
    
    @sp.entry_point
    def add_voter(self, add_remove_voter_arg):
        sp.set_type(add_remove_voter_arg, sp.TAddress)
        sp.verify(self.data.administrator == sp.sender)
        self.add_voter_internal(add_remove_voter_arg)
        
    @sp.entry_point
    def remove_voter(self, add_remove_voter_arg):
        sp.set_type(add_remove_voter_arg, sp.TAddress)
        sp.verify(self.data.administrator == sp.sender)
        self.remove_voter_internal(add_remove_voter_arg)
        

            
@sp.add_test(name = "Poll")
def test():
    contract = Poll(sp.address("tz1VWU45MQ7nxu5PGgWxgDePemev6bUDNGZ2"))
    scenario = sp.test_scenario()
    #scenario = contract.test_update_map()
#     scenario = sp.test_scenario()
    scenario.h1("Poll")
    scenario += contract
    # scenario += contract.check("bajs")
    # scenario += contract.test_update_map(sp.some(sp.unit))
    scenario += contract.create_poll(sp.record(id = "first_poll", meta_data = sp.record(e = sp.timestamp(100), n = sp.nat(4)))).run(sender=sp.address("tz1VWU45MQ7nxu5PGgWxgDePemev6bUDNGZ2"))
    scenario += contract.add_voter(sp.address("tz1azKk3gBJRjW11JAh8J1CBP1tF2NUu5yJ3")).run(sender=sp.address("tz1VWU45MQ7nxu5PGgWxgDePemev6bUDNGZ2"))
    scenario += contract.add_voter(sp.address("tz1Q3eT3kwr1hfvK49HK8YqPadNXzxdxnE7u")).run(sender=sp.address("tz1VWU45MQ7nxu5PGgWxgDePemev6bUDNGZ2"))
    scenario += contract.remove_voter(sp.address("tz1Q3eT3kwr1hfvK49HK8YqPadNXzxdxnE7u")).run(sender=sp.address("tz1VWU45MQ7nxu5PGgWxgDePemev6bUDNGZ2"))
    scenario += contract.vote(sp.record(id = "first_poll", my_vote = sp.nat(4))).run(sender=sp.address("tz1azKk3gBJRjW11JAh8J1CBP1tF2NUu5yJ3"), now = sp.timestamp(90), valid=True)
    # sp.record(id = "first_poll", my_vote = sp.nat(2))
    
    
    
#     c1.test_map_get_opt({})
#     c1.test_map_get_opt({12: "A"})
# #   scenario += contract.replace(2)
#   scenario += contract.double()