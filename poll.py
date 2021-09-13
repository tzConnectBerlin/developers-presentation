import smartpy as sp





class Poll(sp.Contract):
    def __init__(self, admin: sp.TAddress):
        self.init_type(sp.TRecord(
            administrator = sp.TAddress, 
            polls = sp.TBigMap(sp.TString, sp.TRecord(metadata = sp.TRecord(end_date = sp.TTimestamp, num_option = sp.TNat).layout(("end_date", "num_option")), totals = sp.TMap(sp.TNat, sp.TNat)).layout(("metadata", "totals"))), 
            voters = sp.TBigMap(sp.TAddress, sp.TUnit), 
            votes = sp.TBigMap(sp.TPair(sp.TAddress, sp.TString), sp.TNat)).layout((("administrator", "polls"), ("voters", "votes")))
        )

        self.init(
            administrator = admin,
            voters = sp.big_map(),
            votes = sp.big_map(),
            polls = sp.big_map()
        )


    def add_voter_internal(self, params):
        self.data.voters = sp.update_map(self.data.voters, params, sp.some(sp.unit))
    
    def remove_voter_internal(self, params):
        self.data.voters = sp.update_map(self.data.voters, params, sp.none)
    
    def create_poll_internal(self, id, params):
        poll_meta = sp.record(end_date = params.e, num_option = params.n)
        tot = sp.map(tkey = sp.TNat, tvalue = sp.TNat)
        poll = sp.record(metadata = poll_meta, totals = tot)
        self.data.polls = sp.update_map(self.data.polls, id, sp.some(poll))
    
    
        
    
    @sp.entry_point
    def create_poll(self, create_poll_arg):
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
        sp.if self.data.votes.get((sp.sender, vote_arg.id), default_value=0) == 0:
            old_val = totals.get(mvote, sp.nat(0)) 
            new_val = sp.nat(1) + old_val 
            totals = sp.update_map(totals, mvote, sp.some(new_val))
            poll = sp.record(metadata = metadata, totals = totals)
            self.data.polls = sp.update_map(self.data.polls, vote_arg.id, sp.some(poll))
            self.data.votes = sp.update_map(self.data.votes, (sp.sender, vote_arg.id), sp.some(mvote))
            
            
        sp.else:
            poll = self.data.polls[vote_arg.id]
            totals = poll.totals
            old_vote = self.data.votes.get((sp.sender, vote_arg.id))
            old_val_tot = totals.get(old_vote, sp.nat(1))
            new_old_val = abs(old_val_tot - 1)
            new_totals = sp.update_map(totals, old_vote, sp.some(new_old_val))
            poll = sp.record(metadata = metadata, totals = new_totals)
            old_new_val = new_totals.get(mvote, sp.nat(0)) 
            new_val = old_new_val + sp.nat(1)
            new_new_totals = sp.update_map(new_totals, mvote, sp.some(new_val))
            poll = sp.record(metadata = metadata, totals = new_new_totals)
            self.data.polls = sp.update_map(self.data.polls, vote_arg.id, sp.some(poll))
            self.data.votes = sp.update_map(self.data.votes, (sp.sender, vote_arg.id), sp.some(mvote))
            
    
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
    scenario.h1("Poll")
    scenario += contract
    scenario += contract.create_poll(sp.record(id = "first_poll", meta_data = sp.record(e = sp.timestamp(100), n = sp.nat(4)))).run(sender=sp.address("tz1VWU45MQ7nxu5PGgWxgDePemev6bUDNGZ2"))
    scenario += contract.add_voter(sp.address("tz1azKk3gBJRjW11JAh8J1CBP1tF2NUu5yJ3")).run(sender=sp.address("tz1VWU45MQ7nxu5PGgWxgDePemev6bUDNGZ2"))
    scenario += contract.add_voter(sp.address("tz1Q3eT3kwr1hfvK49HK8YqPadNXzxdxnE7u")).run(sender=sp.address("tz1VWU45MQ7nxu5PGgWxgDePemev6bUDNGZ2"))
    scenario += contract.add_voter(sp.address("tz1VWU45MQ7nxu5PGgWxgDePemev6bUDNGZ2")).run(sender=sp.address("tz1VWU45MQ7nxu5PGgWxgDePemev6bUDNGZ2"))
    # scenario += contract.remove_voter(sp.address("tz1Q3eT3kwr1hfvK49HK8YqPadNXzxdxnE7u")).run(sender=sp.address("tz1VWU45MQ7nxu5PGgWxgDePemev6bUDNGZ2"))
    scenario += contract.vote(sp.record(id = "first_poll", my_vote = sp.nat(4))).run(sender=sp.address("tz1azKk3gBJRjW11JAh8J1CBP1tF2NUu5yJ3"), now = sp.timestamp(50))
    scenario += contract.vote(sp.record(id = "first_poll", my_vote = sp.nat(3))).run(sender=sp.address("tz1azKk3gBJRjW11JAh8J1CBP1tF2NUu5yJ3"), now = sp.timestamp(60))
    scenario += contract.vote(sp.record(id = "first_poll", my_vote = sp.nat(3))).run(sender=sp.address("tz1azKk3gBJRjW11JAh8J1CBP1tF2NUu5yJ3"), now = sp.timestamp(65))
    scenario += contract.vote(sp.record(id = "first_poll", my_vote = sp.nat(3))).run(sender=sp.address("tz1Q3eT3kwr1hfvK49HK8YqPadNXzxdxnE7u"), now = sp.timestamp(80))
    
    
    
    
