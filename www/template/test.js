/**
 * this is test for MyClass.
 * @test {MyClass}
 */
describe('test MyClass', ()=>{
  /**
   * this is test for MyClass#method.
   * @test {MyClass#method}
   */
  it('has a method', ()=>{
    assert(new MyClass(100).method);
  });
});
